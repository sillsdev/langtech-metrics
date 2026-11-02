#!/usr/bin/env python3
"""Converts a raw "App Catalogue" Google Sheet export (.xlsx) into a monthly
input file for scripts/push-app-stats.mjs.

Usage:
  py scripts/convert-app-catalogue.py "<path to the App Catalogue export>"
  e.g. py scripts/convert-app-catalogue.py "input/apps/20261102 - App Catalogue (SIL and partners internal use only).xlsx"

Requires `openpyxl` (py -3 -m pip install openpyxl) -- not a project
dependency since this only ever runs by hand, like convert-dashboard-export.py.

ONLY the "Summary" and "Trends" sheets are ever opened. The App Catalogue is
marked "SIL and partners internal use only" -- publication on this dashboard
is approved for figures from those two sheets alone (confirmed Nov 2026). Every
other sheet (Android Apps, iOS Apps, Developer Totals, Country/Area Totals,
Developers, Apps to omit, Notes, Find.Bible...) holds per-app/per-developer
detail that is NOT cleared for publication -- do not read it here, ever.

What it reads:

- "Summary": the "Android Apps - Published Online" table (one row per app type
  -- Scripture/Dictionary/Reading/Keyboard -- plus its TOTALS row), the
  "Android Apps - Published Offline" row (FCBH Global Bible Apps) and the
  "iOS Apps" table (Scripture/Dictionary/Reading, no Keyboard, plus TOTALS).
  Columns are read by each row's own label in column B (there's no header row
  to key off of for the sheet as a whole, so the label row -- "Scripture",
  "TOTALS", "FCBH Global Bible Apps", etc. -- is the key), with "App Type"
  header rows confirming the expected column layout (languages, countries,
  apps, developers-or-unlisted, installs-if-present) before data rows are read.
- "Trends": the "Scripture Apps - Trends over time" table (Date, Number of
  apps, Number of langs, Installs) -- the only historical series the
  catalogue tracks; it does not track Dictionary/Reading/Keyboard apps over
  time, only Scripture.

The newest Trends row sometimes isn't a real update yet -- just the same
figures as the previous row, carried forward before that month's count has
actually been redone (seen in the 2 Nov 2026 export: its "2026-11-02" row is a
byte-for-byte duplicate of "2026-10-16"). Dropping it is safe and general:
repeatedly drop the newest row while it exactly matches (apps, langs,
installs) of the next-newest one. The month this import is filed under is the
calendar month of the newest *kept* Trends row -- the Summary tables carry no
date of their own, so they're filed under whatever month the Trends series
says is current.
"""

import json
import sys
from datetime import datetime, timezone
from pathlib import Path

try:
    import openpyxl
except ImportError:
    print("Missing dependency. Run: py -3 -m pip install openpyxl", file=sys.stderr)
    sys.exit(1)

ONLINE_TYPES = {"Scripture", "Dictionary", "Reading", "Keyboard"}
IOS_TYPES = {"Scripture", "Dictionary", "Reading"}


def find_row(rows, label, start=0, col=1):
    for i in range(start, len(rows)):
        row = rows[i]
        if len(row) > col and row[col] == label:
            return i
    sys.exit(f"couldn't find a row labeled {label!r} -- the sheet layout has changed.")


def read_section(rows, section_label, member_labels, col6_field, has_installs, start=0):
    """Reads one "App Type" table (data rows keyed by column B's label, in the
    fixed column order every section in this sheet uses: label, code,
    languages, countries, apps, a 6th column that's "Developers" in two
    sections and "Unlisted" in the offline one, installs-if-present), from
    `section_label`'s header row to its TOTALS row."""
    section_at = find_row(rows, section_label, start)
    header_at = find_row(rows, "App Type", section_at)

    # Not every section has a TOTALS row (the offline one doesn't -- it's a single
    # row, FCBH Global Bible Apps, with nothing to total) -- so a label that's
    # neither TOTALS nor an expected member also ends the section, and is left
    # unconsumed (returned as the next search position) rather than skipped, so
    # the next read_section call can still find it as its own section header.
    members = {}
    totals = None
    i = header_at + 1
    while True:
        row = rows[i]
        label = row[1] if row else None
        if label is None:
            i += 1
            continue
        if label != "TOTALS" and label not in member_labels:
            break
        fields = {
            "languages": row[3],
            "countries": row[4],
            "apps": row[5],
            col6_field: row[6],
            "installs": row[7] if has_installs else None,
        }
        if label == "TOTALS":
            totals = fields
            i += 1
            break
        members[label] = fields
        i += 1
    return members, totals, i


def read_trends(rows):
    header_at = find_row(rows, "Date", 0, col=0)
    points = []
    for i in range(header_at + 1, len(rows)):
        date_cell = rows[i][0] if rows[i] else None
        if not isinstance(date_cell, datetime):
            break
        as_int = lambda v: None if v is None else int(v)
        points.append({
            "date": date_cell.strftime("%Y-%m-%d"),
            "apps": as_int(rows[i][1]),
            "langs": as_int(rows[i][2]),
            "installs": as_int(rows[i][3]),
        })

    # Newest-first in the sheet already; drop a trailing (newest) point that's
    # an exact carry-forward of the one before it -- see module docstring.
    while len(points) >= 2 and (points[0]["apps"], points[0]["langs"], points[0]["installs"]) == (
        points[1]["apps"], points[1]["langs"], points[1]["installs"]
    ):
        dropped = points.pop(0)
        print(f"Trends: dropping {dropped['date']} -- identical to the previous point, looks not-yet-updated.")

    return points


def main():
    if len(sys.argv) != 2:
        print(f"Usage: py {sys.argv[0]} <path to an App Catalogue .xlsx export>", file=sys.stderr)
        sys.exit(1)

    xlsx_path = Path(sys.argv[1])
    wb = openpyxl.load_workbook(xlsx_path, data_only=True, read_only=True)
    for required in ("Summary", "Trends"):
        if required not in wb.sheetnames:
            sys.exit(f"No {required!r} sheet in {xlsx_path.name}. Sheets: {wb.sheetnames}")

    summary_rows = list(wb["Summary"].iter_rows(values_only=True))
    online_types, online_totals, after_online = read_section(
        summary_rows, "Android Apps - Published Online", ONLINE_TYPES, "developers", has_installs=True
    )
    offline_types, offline_totals, after_offline = read_section(
        summary_rows, "Android Apps - Published Offline", {"FCBH Global Bible Apps"}, "unlisted", has_installs=False, start=after_online
    )
    ios_types, ios_totals, _ = read_section(
        summary_rows, "iOS Apps - Published on Apple App Store", IOS_TYPES, "developers", has_installs=False, start=after_offline
    )

    trend = read_trends(list(wb["Trends"].iter_rows(values_only=True)))
    if not trend:
        sys.exit("Trends: no data points found -- the sheet layout has changed.")
    month = trend[0]["date"][:7]

    types = [{"type": name, **fields} for name, fields in online_types.items()]

    output = {
        "month": month,
        "generatedAt": datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%S.000Z"),
        "totals": online_totals,
        "types": types,
        "ios": {"types": [{"type": name, **fields} for name, fields in ios_types.items()], "totals": ios_totals},
        "offline": offline_types.get("FCBH Global Bible Apps"),
        "trend": trend,
    }

    repo_root = Path(__file__).resolve().parent.parent
    out_dir = repo_root / "input" / "apps"
    out_dir.mkdir(parents=True, exist_ok=True)
    out_path = out_dir / f"{month}.js"
    body = json.dumps(output, indent=2, ensure_ascii=False)
    out_path.write_text(
        f"// Auto-generated by scripts/convert-app-catalogue.py from\n"
        f"// {xlsx_path.name}. Do not hand-edit -- re-run the converter instead.\n"
        f"export default {body};\n",
        encoding="utf-8",
    )

    print(f"Wrote {out_path} (month {month}, {len(types)} app type(s), {len(trend)} trend point(s)).")


if __name__ == "__main__":
    main()
