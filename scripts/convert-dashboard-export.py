#!/usr/bin/env python3
"""Converts a raw "LangTech Analytics Dashboard" Google Sheet export (.xlsx)
into a products input file for scripts/push-products.mjs (see
api/_data/products.template.js for that file's shape).

Usage:
  py scripts/convert-dashboard-export.py "<path to the quarter's .xlsx export>" <quarter>
  e.g. py scripts/convert-dashboard-export.py "LangTech Analytics Dashboard_Q3.xlsx" FY26Q3

Requires `openpyxl` (py -3 -m pip install openpyxl) -- not a project
dependency since this only ever runs by hand, by the person doing the
quarterly push, not as part of the deployed API.

What it reads (layout as of the FY26Q3 export -- re-check these if a future
export reshuffles columns):

- "Product List" sheet, header on row 2 (row 1 is blank): one row per
  product, grouped under section-header rows (e.g. a lone "Literacy" in
  column A with every other column blank -- these, the "Fonts" section, and
  the trailing "List of Products/Tools for further consideration" block all
  have a blank Category column).
    A Product Name | B Category | C Owner | D Analytics Collection Docs |
    E Platform(s) | F Development Status | G Offline | H Metrics collection
    mode | I (test data) | J Product Page | K Open Source Repo?
  "Product Page" cells are frequently hyperlinked with a different, real URL
  than their displayed text -- must read the hyperlink target, not the
  value. "Platform(s)" is a comma-separated list. "Open Source Repo?" is free
  text ("Yes", "No", "Yes + LfMerge", "No, (see link)") reduced to a bool.
- One sheet per quarter (named exactly the quarter label, e.g. "FY26Q3"),
  same product-name rows, header on row 2:
    A Product Name | B (completion %, ignored) | ... | J Downloads |
    K Installs | L Active Projects | M New Projects Started | N Active Users
    | O Avg MAU | P-R MAU per month | S Number of User Countries |
    T Number of Languages Impacted | ...
  Only J, K, L, N, S, T map to the template's metrics object.

Inclusion rule (matches the README's "excludes the sheet's Fonts section and
any placeholder rows with no dev status and no metrics ever recorded"):
include a Product List row only if Category is non-blank, AND either
Development Status is filled or the row has at least one non-null metric in
this quarter's sheet. Verified against the FY26Q3 export: this is exactly
what drops the Fonts section, section-header rows, and placeholder rows like
"App Builder PWA?" / "Reading Apps" / "Keyboard Apps" / "Keyman Keyboards".
"""

import json
import sys
from pathlib import Path

try:
    import openpyxl
except ImportError:
    print("Missing dependency. Run: py -3 -m pip install openpyxl", file=sys.stderr)
    sys.exit(1)

METADATA_HEADER_ROW = 2
METADATA_FIRST_DATA_ROW = 3
METRICS_HEADER_ROW = 2
METRICS_FIRST_DATA_ROW = 3

COL_NAME = 1
COL_CATEGORY = 2
COL_PLATFORMS = 5
COL_DEV_STATUS = 6
COL_METRICS_MODE = 8
COL_PRODUCT_PAGE = 10
COL_OPEN_SOURCE = 11

COL_DOWNLOADS = 10
COL_INSTALLS = 11
COL_ACTIVE_PROJECTS = 12
COL_ACTIVE_USERS = 14
COL_COUNTRIES = 19
COL_LANGUAGES_IMPACTED = 20


def clean_number(value):
    # Metric cells are sometimes a placeholder string ("N/A", "n/a", "-", ...)
    # instead of being left blank -- treat anything that isn't a real number
    # as no data, rather than letting a literal "n/a" string reach the JSON
    # (that's what showed up as NaN on the front end for Scripture Forge and
    # Serval's active_users/countries).
    if value is None:
        return None
    if isinstance(value, (int, float)):
        if isinstance(value, float) and value.is_integer():
            return int(value)
        return value
    if isinstance(value, str):
        text = value.strip()
        if not text:
            return None
        try:
            number = float(text)
        except ValueError:
            return None
        return int(number) if number.is_integer() else number
    return None


def read_metrics_sheet(ws):
    by_name = {}
    for row in range(METRICS_FIRST_DATA_ROW, ws.max_row + 1):
        name = ws.cell(row=row, column=COL_NAME).value
        if not name:
            continue
        by_name[name] = {
            "downloads": clean_number(ws.cell(row=row, column=COL_DOWNLOADS).value),
            "installs": clean_number(ws.cell(row=row, column=COL_INSTALLS).value),
            "active_projects": clean_number(ws.cell(row=row, column=COL_ACTIVE_PROJECTS).value),
            "active_users": clean_number(ws.cell(row=row, column=COL_ACTIVE_USERS).value),
            "countries": clean_number(ws.cell(row=row, column=COL_COUNTRIES).value),
            "languages_impacted": clean_number(ws.cell(row=row, column=COL_LANGUAGES_IMPACTED).value),
        }
    return by_name


def product_url(cell):
    if cell.hyperlink is not None and cell.hyperlink.target:
        return cell.hyperlink.target
    value = cell.value
    if isinstance(value, str) and value.lower().startswith("http"):
        return value
    return None


def is_open_source(value):
    if not isinstance(value, str):
        return False
    return value.strip().lower().startswith("yes")


def has_any_metric(metrics):
    return any(v is not None for v in metrics.values())


def main():
    if len(sys.argv) != 3:
        print(f"Usage: py {sys.argv[0]} <path to .xlsx export> <quarter, e.g. FY26Q3>", file=sys.stderr)
        sys.exit(1)

    xlsx_path = Path(sys.argv[1])
    quarter = sys.argv[2]

    wb = openpyxl.load_workbook(xlsx_path, data_only=True)
    if quarter not in wb.sheetnames:
        print(f"No sheet named '{quarter}' in {xlsx_path.name}. Sheets: {wb.sheetnames}", file=sys.stderr)
        sys.exit(1)

    metrics_by_name = read_metrics_sheet(wb[quarter])

    product_list = wb["Product List"]
    products = []
    skipped = []
    for row in range(METADATA_FIRST_DATA_ROW, product_list.max_row + 1):
        name = product_list.cell(row=row, column=COL_NAME).value
        if not name:
            continue
        category = product_list.cell(row=row, column=COL_CATEGORY).value
        if not category:
            continue  # section headers, Fonts section, "further consideration" block

        dev_status = product_list.cell(row=row, column=COL_DEV_STATUS).value
        metrics = metrics_by_name.get(name, {
            "downloads": None, "installs": None, "active_projects": None,
            "active_users": None, "countries": None, "languages_impacted": None,
        })
        if not dev_status and not has_any_metric(metrics):
            skipped.append(name)
            continue

        platforms_raw = product_list.cell(row=row, column=COL_PLATFORMS).value or ""
        platforms = [p.strip() for p in platforms_raw.split(",") if p.strip()]
        metrics_mode = product_list.cell(row=row, column=COL_METRICS_MODE).value

        products.append({
            "name": name,
            "category": category,
            "platforms": platforms,
            "devStatus": dev_status,
            "metricsMode": metrics_mode,
            "productUrl": product_url(product_list.cell(row=row, column=COL_PRODUCT_PAGE)),
            "openSource": is_open_source(product_list.cell(row=row, column=COL_OPEN_SOURCE).value),
            "metrics": metrics,
        })

    from datetime import datetime, timezone
    generated_at = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%S.000Z")

    output = {
        "quarter": quarter,
        "generatedAt": generated_at,
        "products": products,
    }

    repo_root = Path(__file__).resolve().parent.parent
    out_dir = repo_root / "input" / "products"
    out_dir.mkdir(parents=True, exist_ok=True)
    out_path = out_dir / f"{quarter}.js"
    body = json.dumps(output, indent=2, ensure_ascii=False)
    out_path.write_text(
        f"// Auto-generated by scripts/convert-dashboard-export.py from\n"
        f"// {xlsx_path.name}. Do not hand-edit -- re-run the converter instead.\n"
        f"export default {body};\n",
        encoding="utf-8",
    )

    print(f"Wrote {out_path} ({len(products)} product(s)).")
    if skipped:
        print(f"Skipped {len(skipped)} placeholder row(s) (no dev status, no metrics): {', '.join(skipped)}")


if __name__ == "__main__":
    main()
