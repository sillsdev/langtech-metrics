// Snapshot of the "LangTech Analytics Dashboard" Google Sheet, generated 2026-08-28
// from a manual export (see input/). Covers all non-font products for the last two
// fiscal quarters. Kept as a human-diffable record of data changes; api/products.js
// itself reads from Global Config (see scripts/lib/global-config.mjs), which
// scripts/push-products.mjs pushes this file's contents to.
//
// To refresh: re-parse a newer export of the sheet (Product List tab for metadata,
// the quarterly tabs for metrics, joined by product name), replace this file's
// staticProducts value, then run `node scripts/push-products.mjs`.

export const staticProducts = {
  "generatedAt": "2026-08-25T00:00:00Z",
  "static": true,
  "quarters": [
    "FY26Q2",
    "FY26Q3"
  ],
  "categories": [
    "Keyboarding",
    "Language Audio/Documentation",
    "Language Drafting",
    "Language Publishing",
    "Literacy",
    "Scripture Audio",
    "Scripture Drafting",
    "Scripture Publishing"
  ],
  "platforms": [
    "API",
    "Android",
    "Linux",
    "Mac",
    "Web",
    "Windows",
    "iOS"
  ],
  "devStatuses": [
    "Active - Mixed Funding",
    "Active - Unfunded",
    "Maintenance",
    "Unsupported"
  ],
  "products": [
    {
      "name": "Bloom Editor",
      "category": "Literacy",
      "platforms": [
        "Windows"
      ],
      "devStatus": "Active - Mixed Funding",
      "metricsMode": "Opt Out",
      "productUrl": "https://bloomlibrary.org/download",
      "openSource": true,
      "quarters": {
        "FY26Q2": {
          "downloads": null,
          "installs": 629,
          "active_projects": 701,
          "active_users": 2061,
          "countries": 104,
          "languages_impacted": 701
        },
        "FY26Q3": {
          "downloads": null,
          "installs": 673,
          "active_projects": 854,
          "active_users": 2245,
          "countries": 122,
          "languages_impacted": 854
        }
      }
    },
    {
      "name": "Bloom Library",
      "category": "Literacy",
      "platforms": [
        "Web"
      ],
      "devStatus": "Active - Mixed Funding",
      "metricsMode": "Unconditional",
      "productUrl": "https://bloomlibrary.org/download",
      "openSource": true,
      "quarters": {
        "FY26Q2": {
          "downloads": null,
          "installs": null,
          "active_projects": null,
          "active_users": 31011,
          "countries": 201,
          "languages_impacted": 681
        },
        "FY26Q3": {
          "downloads": null,
          "installs": null,
          "active_projects": null,
          "active_users": 31536,
          "countries": 202,
          "languages_impacted": 679
        }
      }
    },
    {
      "name": "Bloom Reader",
      "category": "Literacy",
      "platforms": [
        "Android"
      ],
      "devStatus": "Active - Mixed Funding",
      "metricsMode": "Opt Out",
      "productUrl": "https://bloomlibrary.org/bloom-reader",
      "openSource": true,
      "quarters": {
        "FY26Q2": {
          "downloads": null,
          "installs": 1570,
          "active_projects": null,
          "active_users": 4452,
          "countries": 150,
          "languages_impacted": 455
        },
        "FY26Q3": {
          "downloads": null,
          "installs": 2464,
          "active_projects": null,
          "active_users": 5453,
          "countries": 143,
          "languages_impacted": 471
        }
      }
    },
    {
      "name": "BloomPUB Viewer",
      "category": "Literacy",
      "platforms": [
        "Windows"
      ],
      "devStatus": "Active - Mixed Funding",
      "metricsMode": "Unconditional",
      "productUrl": "https://bloomlibrary.org/bloompub-viewer",
      "openSource": true,
      "quarters": {
        "FY26Q2": {
          "downloads": null,
          "installs": null,
          "active_projects": null,
          "active_users": 1301,
          "countries": 28,
          "languages_impacted": 87
        },
        "FY26Q3": {
          "downloads": null,
          "installs": null,
          "active_projects": null,
          "active_users": 1363,
          "countries": 30,
          "languages_impacted": 99
        }
      }
    },
    {
      "name": "Reading App Builder",
      "category": "Literacy",
      "platforms": [
        "Windows",
        "Mac",
        "Linux"
      ],
      "devStatus": "Active - Mixed Funding",
      "metricsMode": "Unknown",
      "productUrl": "https://software.sil.org/readingappbuilder",
      "openSource": false,
      "quarters": {
        "FY26Q2": {
          "downloads": 147,
          "installs": null,
          "active_projects": null,
          "active_users": null,
          "countries": null,
          "languages_impacted": null
        },
        "FY26Q3": {
          "downloads": null,
          "installs": null,
          "active_projects": null,
          "active_users": null,
          "countries": null,
          "languages_impacted": null
        }
      }
    },
    {
      "name": "The Combine",
      "category": "Language Drafting",
      "platforms": [
        "Linux",
        "Web"
      ],
      "devStatus": "Active - Unfunded",
      "metricsMode": "Opt In",
      "productUrl": "https://software.sil.org/thecombine/",
      "openSource": true,
      "quarters": {
        "FY26Q2": {
          "downloads": null,
          "installs": null,
          "active_projects": 33,
          "active_users": 113,
          "countries": null,
          "languages_impacted": 28
        },
        "FY26Q3": {
          "downloads": null,
          "installs": null,
          "active_projects": 23,
          "active_users": 55,
          "countries": 15,
          "languages_impacted": 20
        }
      }
    },
    {
      "name": "FieldWorks",
      "category": "Language Drafting",
      "platforms": [
        "Windows"
      ],
      "devStatus": "Active - Mixed Funding",
      "metricsMode": "Opt Out",
      "productUrl": "https://software.sil.org/fieldworks/",
      "openSource": true,
      "quarters": {
        "FY26Q2": {
          "downloads": null,
          "installs": 1159,
          "active_projects": null,
          "active_users": 3757,
          "countries": 145,
          "languages_impacted": null
        },
        "FY26Q3": {
          "downloads": null,
          "installs": null,
          "active_projects": null,
          "active_users": null,
          "countries": null,
          "languages_impacted": null
        }
      }
    },
    {
      "name": "FieldWorks Lite",
      "category": "Language Drafting",
      "platforms": [
        "Windows",
        "Linux",
        "Android"
      ],
      "devStatus": "Active - Unfunded",
      "metricsMode": "Unconditional",
      "productUrl": "https://software.sil.org/fieldworks/download/fieldworks-lite/",
      "openSource": true,
      "quarters": {
        "FY26Q2": {
          "downloads": 751,
          "installs": 113,
          "active_projects": 70,
          "active_users": 100,
          "countries": 24,
          "languages_impacted": 48
        },
        "FY26Q3": {
          "downloads": null,
          "installs": null,
          "active_projects": null,
          "active_users": null,
          "countries": null,
          "languages_impacted": null
        }
      }
    },
    {
      "name": "FLExTrans",
      "category": "Language Drafting",
      "platforms": [
        "Windows"
      ],
      "devStatus": "Active - Unfunded",
      "metricsMode": "Opt Out",
      "productUrl": "https://software.sil.org/flextrans/",
      "openSource": true,
      "quarters": {
        "FY26Q2": {
          "downloads": 46,
          "installs": null,
          "active_projects": 5,
          "active_users": 7,
          "countries": 5,
          "languages_impacted": 5
        },
        "FY26Q3": {
          "downloads": null,
          "installs": null,
          "active_projects": null,
          "active_users": null,
          "countries": null,
          "languages_impacted": null
        }
      }
    },
    {
      "name": "Language Forge",
      "category": "Language Drafting",
      "platforms": [
        "Web"
      ],
      "devStatus": "Maintenance",
      "metricsMode": "Unknown",
      "productUrl": "https://languageforge.org/",
      "openSource": true,
      "quarters": {
        "FY26Q2": {
          "downloads": 0,
          "installs": 0,
          "active_projects": 21,
          "active_users": 358,
          "countries": 48,
          "languages_impacted": 14
        },
        "FY26Q3": {
          "downloads": 0,
          "installs": 0,
          "active_projects": 8,
          "active_users": 219,
          "countries": 42,
          "languages_impacted": 6
        }
      }
    },
    {
      "name": "Lexbox",
      "category": "Language Drafting",
      "platforms": [
        "Web"
      ],
      "devStatus": "Active - Unfunded",
      "metricsMode": "Unconditional",
      "productUrl": "https://lexbox.org/",
      "openSource": true,
      "quarters": {
        "FY26Q2": {
          "downloads": null,
          "installs": null,
          "active_projects": 573,
          "active_users": 1001,
          "countries": 68,
          "languages_impacted": null
        },
        "FY26Q3": {
          "downloads": null,
          "installs": null,
          "active_projects": null,
          "active_users": null,
          "countries": null,
          "languages_impacted": null
        }
      }
    },
    {
      "name": "Phonology Assistant",
      "category": "Language Drafting",
      "platforms": [
        "Windows"
      ],
      "devStatus": "Maintenance",
      "metricsMode": "Unknown",
      "productUrl": "https://software.sil.org/phonologyassistant/",
      "openSource": true,
      "quarters": {
        "FY26Q2": {
          "downloads": 108,
          "installs": null,
          "active_projects": null,
          "active_users": null,
          "countries": null,
          "languages_impacted": null
        },
        "FY26Q3": {
          "downloads": null,
          "installs": null,
          "active_projects": null,
          "active_users": null,
          "countries": null,
          "languages_impacted": null
        }
      }
    },
    {
      "name": "WeSay",
      "category": "Language Drafting",
      "platforms": [
        "Windows"
      ],
      "devStatus": "Unsupported",
      "metricsMode": "Unknown",
      "productUrl": "https://software.sil.org/wesay/",
      "openSource": true,
      "quarters": {
        "FY26Q2": {
          "downloads": 79,
          "installs": null,
          "active_projects": null,
          "active_users": null,
          "countries": null,
          "languages_impacted": null
        },
        "FY26Q3": {
          "downloads": null,
          "installs": null,
          "active_projects": null,
          "active_users": null,
          "countries": null,
          "languages_impacted": null
        }
      }
    },
    {
      "name": "SayMore",
      "category": "Language Audio/Documentation",
      "platforms": [
        "Windows"
      ],
      "devStatus": "Maintenance",
      "metricsMode": "Opt Out",
      "productUrl": "https://software.sil.org/saymore/",
      "openSource": true,
      "quarters": {
        "FY26Q2": {
          "downloads": 182,
          "installs": 392,
          "active_projects": 631,
          "active_users": 631,
          "countries": 52,
          "languages_impacted": 631
        },
        "FY26Q3": {
          "downloads": 398,
          "installs": 244,
          "active_projects": 528,
          "active_users": 528,
          "countries": 63,
          "languages_impacted": 528
        }
      }
    },
    {
      "name": "Dictionary App Builder",
      "category": "Language Publishing",
      "platforms": [
        "Windows",
        "Mac",
        "Linux"
      ],
      "devStatus": "Active - Unfunded",
      "metricsMode": "Unknown",
      "productUrl": "https://software.sil.org/dictionaryappbuilder",
      "openSource": false,
      "quarters": {
        "FY26Q2": {
          "downloads": 298,
          "installs": null,
          "active_projects": null,
          "active_users": null,
          "countries": null,
          "languages_impacted": null
        },
        "FY26Q3": {
          "downloads": null,
          "installs": null,
          "active_projects": null,
          "active_users": null,
          "countries": null,
          "languages_impacted": null
        }
      }
    },
    {
      "name": "Webonary",
      "category": "Language Publishing",
      "platforms": [
        "Web"
      ],
      "devStatus": "Maintenance",
      "metricsMode": "Unknown",
      "productUrl": null,
      "openSource": true,
      "quarters": {
        "FY26Q2": {
          "downloads": null,
          "installs": null,
          "active_projects": null,
          "active_users": 144000,
          "countries": 209,
          "languages_impacted": null
        },
        "FY26Q3": {
          "downloads": null,
          "installs": null,
          "active_projects": null,
          "active_users": null,
          "countries": null,
          "languages_impacted": null
        }
      }
    },
    {
      "name": "Paratext 9",
      "category": "Scripture Drafting",
      "platforms": [
        "Windows"
      ],
      "devStatus": "Active - Mixed Funding",
      "metricsMode": "Unknown",
      "productUrl": "https://paratext.org/",
      "openSource": false,
      "quarters": {
        "FY26Q2": {
          "downloads": null,
          "installs": null,
          "active_projects": 6507,
          "active_users": 12975,
          "countries": 159,
          "languages_impacted": 4178
        },
        "FY26Q3": {
          "downloads": null,
          "installs": null,
          "active_projects": 8070,
          "active_users": 15539,
          "countries": 161,
          "languages_impacted": 4127
        }
      }
    },
    {
      "name": "Paratext Lite",
      "category": "Scripture Drafting",
      "platforms": [
        "Android",
        "Windows",
        "Mac",
        "Linux"
      ],
      "devStatus": "Maintenance",
      "metricsMode": "Unknown",
      "productUrl": "https://play.google.com/store/apps/details?id=org.paratext.ptlite&amp;hl=en",
      "openSource": false,
      "quarters": {
        "FY26Q2": {
          "downloads": 1232,
          "installs": 533,
          "active_projects": 272,
          "active_users": 940,
          "countries": 120,
          "languages_impacted": 275
        },
        "FY26Q3": {
          "downloads": 1075,
          "installs": 463,
          "active_projects": 446,
          "active_users": 1080,
          "countries": 121,
          "languages_impacted": 398
        }
      }
    },
    {
      "name": "Scripture Forge",
      "category": "Scripture Drafting",
      "platforms": [
        "Web"
      ],
      "devStatus": "Active - Mixed Funding",
      "metricsMode": "Unknown",
      "productUrl": "https://scriptureforge.org/",
      "openSource": true,
      "quarters": {
        "FY26Q2": {
          "downloads": null,
          "installs": null,
          "active_projects": 598,
          "active_users": null,
          "countries": null,
          "languages_impacted": 544
        },
        "FY26Q3": {
          "downloads": null,
          "installs": null,
          "active_projects": 1116,
          "active_users": null,
          "countries": null,
          "languages_impacted": 608
        }
      }
    },
    {
      "name": "Transcelerator",
      "category": "Scripture Drafting",
      "platforms": [
        "Windows"
      ],
      "devStatus": "Active - Unfunded",
      "metricsMode": "Opt Out",
      "productUrl": "https://software.sil.org/transcelerator/",
      "openSource": true,
      "quarters": {
        "FY26Q2": {
          "downloads": 21,
          "installs": 24,
          "active_projects": 35,
          "active_users": 34,
          "countries": 15,
          "languages_impacted": 35
        },
        "FY26Q3": {
          "downloads": 62,
          "installs": 51,
          "active_projects": 65,
          "active_users": 65,
          "countries": 18,
          "languages_impacted": 65
        }
      }
    },
    {
      "name": "Serval",
      "category": "Scripture Drafting",
      "platforms": [
        "API"
      ],
      "devStatus": null,
      "metricsMode": "Unknown",
      "productUrl": "https://ai.sil.org/projects/serval",
      "openSource": true,
      "quarters": {
        "FY26Q2": {
          "downloads": null,
          "installs": null,
          "active_projects": 1805,
          "active_users": null,
          "countries": null,
          "languages_impacted": 600
        },
        "FY26Q3": {
          "downloads": null,
          "installs": null,
          "active_projects": 1614,
          "active_users": null,
          "countries": null,
          "languages_impacted": 911
        }
      }
    },
    {
      "name": "Audio Project Manager",
      "category": "Scripture Audio",
      "platforms": [
        "Web",
        "Windows",
        "Linux",
        "Mac"
      ],
      "devStatus": "Active - Mixed Funding",
      "metricsMode": "Unconditional",
      "productUrl": "http://www.audioprojectmanager.org/",
      "openSource": true,
      "quarters": {
        "FY26Q2": {
          "downloads": 74,
          "installs": 69,
          "active_projects": 343,
          "active_users": 80,
          "countries": 59,
          "languages_impacted": 343
        },
        "FY26Q3": {
          "downloads": null,
          "installs": 53,
          "active_projects": 325,
          "active_users": 206,
          "countries": 79,
          "languages_impacted": 325
        }
      }
    },
    {
      "name": "Glyssen",
      "category": "Scripture Audio",
      "platforms": [
        "Windows"
      ],
      "devStatus": "Maintenance",
      "metricsMode": "Opt Out",
      "productUrl": "https://software.sil.org/glyssen/",
      "openSource": true,
      "quarters": {
        "FY26Q2": {
          "downloads": 17,
          "installs": 27,
          "active_projects": 45,
          "active_users": 631,
          "countries": 11,
          "languages_impacted": 29
        },
        "FY26Q3": {
          "downloads": 14,
          "installs": 3,
          "active_projects": 30,
          "active_users": 528,
          "countries": 9,
          "languages_impacted": 13
        }
      }
    },
    {
      "name": "HearThis",
      "category": "Scripture Audio",
      "platforms": [
        "Windows",
        "Android"
      ],
      "devStatus": "Active - Unfunded",
      "metricsMode": "Opt Out",
      "productUrl": "https://software.sil.org/hearthis/",
      "openSource": true,
      "quarters": {
        "FY26Q2": {
          "downloads": 90,
          "installs": 72,
          "active_projects": 211,
          "active_users": 262,
          "countries": 45,
          "languages_impacted": 211
        },
        "FY26Q3": {
          "downloads": 132,
          "installs": 88,
          "active_projects": 236,
          "active_users": 286,
          "countries": 45,
          "languages_impacted": 236
        }
      }
    },
    {
      "name": "HearThis for Android",
      "category": "Scripture Audio",
      "platforms": [
        "Android"
      ],
      "devStatus": "Maintenance",
      "metricsMode": "Unknown",
      "productUrl": null,
      "openSource": true,
      "quarters": {
        "FY26Q2": {
          "downloads": 13,
          "installs": 13,
          "active_projects": 9,
          "active_users": 9,
          "countries": 12,
          "languages_impacted": 9
        },
        "FY26Q3": {
          "downloads": 12,
          "installs": 12,
          "active_projects": 7,
          "active_users": 16,
          "countries": 14,
          "languages_impacted": 7
        }
      }
    },
    {
      "name": "PTXprint",
      "category": "Scripture Publishing",
      "platforms": [
        "Windows",
        "Mac",
        "Linux"
      ],
      "devStatus": "Active - Unfunded",
      "metricsMode": "Unknown",
      "productUrl": "https://software.sil.org/ptxprint/",
      "openSource": true,
      "quarters": {
        "FY26Q2": {
          "downloads": 618,
          "installs": 618,
          "active_projects": 2397,
          "active_users": 553,
          "countries": 85,
          "languages_impacted": 553
        },
        "FY26Q3": {
          "downloads": 1286,
          "installs": 1286,
          "active_projects": 2592,
          "active_users": 1404,
          "countries": 85,
          "languages_impacted": 822
        }
      }
    },
    {
      "name": "Scriptoria App Service",
      "category": "Scripture Publishing",
      "platforms": [
        "Web"
      ],
      "devStatus": "Active - Mixed Funding",
      "metricsMode": "Unknown",
      "productUrl": "https://app.scriptoria.io/",
      "openSource": true,
      "quarters": {
        "FY26Q2": {
          "downloads": null,
          "installs": null,
          "active_projects": 1190,
          "active_users": 45,
          "countries": null,
          "languages_impacted": 988
        },
        "FY26Q3": {
          "downloads": null,
          "installs": null,
          "active_projects": 1477,
          "active_users": 60,
          "countries": null,
          "languages_impacted": 992
        }
      }
    },
    {
      "name": "Scripture App Builder",
      "category": "Scripture Publishing",
      "platforms": [
        "Windows",
        "Mac",
        "Linux"
      ],
      "devStatus": "Active - Mixed Funding",
      "metricsMode": "Unknown",
      "productUrl": "https://software.sil.org/scriptureappbuilder",
      "openSource": false,
      "quarters": {
        "FY26Q2": {
          "downloads": 519,
          "installs": null,
          "active_projects": null,
          "active_users": null,
          "countries": null,
          "languages_impacted": null
        },
        "FY26Q3": {
          "downloads": null,
          "installs": null,
          "active_projects": null,
          "active_users": null,
          "countries": null,
          "languages_impacted": null
        }
      }
    },
    {
      "name": "Keyman Developer",
      "category": "Keyboarding",
      "platforms": [
        "Windows",
        "Mac",
        "Linux"
      ],
      "devStatus": "Active - Mixed Funding",
      "metricsMode": "Unknown",
      "productUrl": "http://keyman.com/",
      "openSource": true,
      "quarters": {
        "FY26Q2": {
          "downloads": 4400,
          "installs": null,
          "active_projects": 1160,
          "active_users": null,
          "countries": null,
          "languages_impacted": 2666
        },
        "FY26Q3": {
          "downloads": 2687,
          "installs": null,
          "active_projects": 1178,
          "active_users": null,
          "countries": null,
          "languages_impacted": 2672
        }
      }
    },
    {
      "name": "Keyman",
      "category": "Keyboarding",
      "platforms": [
        "Windows",
        "Mac",
        "Linux",
        "iOS",
        "Android",
        "Web"
      ],
      "devStatus": "Active - Mixed Funding",
      "metricsMode": "Unknown",
      "productUrl": "http://keyman.com/",
      "openSource": true,
      "quarters": {
        "FY26Q2": {
          "downloads": 458266,
          "installs": null,
          "active_projects": 2666,
          "active_users": null,
          "countries": 200,
          "languages_impacted": 2666
        },
        "FY26Q3": {
          "downloads": 362590,
          "installs": null,
          "active_projects": 2672,
          "active_users": null,
          "countries": 200,
          "languages_impacted": 2672
        }
      }
    },
    {
      "name": "Keyman Web",
      "category": "Keyboarding",
      "platforms": [
        "Web"
      ],
      "devStatus": "Active - Mixed Funding",
      "metricsMode": "Unknown",
      "productUrl": "http://keymanweb.com/",
      "openSource": true,
      "quarters": {
        "FY26Q2": {
          "downloads": 161590,
          "installs": null,
          "active_projects": null,
          "active_users": null,
          "countries": null,
          "languages_impacted": null
        },
        "FY26Q3": {
          "downloads": 185250,
          "installs": null,
          "active_projects": null,
          "active_users": null,
          "countries": null,
          "languages_impacted": null
        }
      }
    },
    {
      "name": "Keyboard App Builder",
      "category": "Keyboarding",
      "platforms": [
        "Windows",
        "Mac",
        "Linux"
      ],
      "devStatus": "Active - Unfunded",
      "metricsMode": "Unknown",
      "productUrl": "https://software.sil.org/keyboardappbuilder",
      "openSource": false,
      "quarters": {
        "FY26Q2": {
          "downloads": 156,
          "installs": null,
          "active_projects": null,
          "active_users": null,
          "countries": null,
          "languages_impacted": null
        },
        "FY26Q3": {
          "downloads": null,
          "installs": null,
          "active_projects": null,
          "active_users": null,
          "countries": null,
          "languages_impacted": null
        }
      }
    }
  ]
};
