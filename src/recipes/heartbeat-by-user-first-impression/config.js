/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/. */

/*jshint forin:true, noarg:false, noempty:true, eqeqeq:true, bitwise:true,
  strict:true, undef:true, curly:false, browser:true,
  unused:true,
  indent:2, maxerr:50, devel:true, node:true, boss:true, white:true,
  globalstrict:true, nomen:false, newcap:true, esnext: true, moz: true  */

/*global require, exports, log */

"use strict";

const VERSION=54;

const million = Math.pow(10,6);
const thousand = Math.pow(10,3);
const days = 24 * 60 * 60 * 1000;

/** EngagementUrl Rules
  *
  * Notes:
  * 1.  first match will win.  PUT MORE SPECIFIC RULES FIRST.
  *     Note: NO automated check of rule order.
  * 2.  'qsurvey' urls will postpend all the 'right' query args.  others won't.
  *     (Write a bug if this is a problem!)
  * 3.  If you need more fields, dig into `src/common/personinfo.js`.
  * 4.  `npm run surveys` will attempt to run some common configs through
  *     the rules.
  * 5.  `test/recipe/test-heartbeat-by-user-first-impression.js` does some
  *     additional linting.
  * 6.  If you would rather specify rule breaks in a 'proportional' style,
  *     use `asBreaks([50,25,25])` => [.50,.75,1]
  */


const filterFields = [
  "updateChannel",
  "fxVersion",
  "locale",
  "country",
  "defaultBrowser",
  "searchEngine",
  "syncSetup"
];




const engagementRules = [
  {
    alias: '^cs, Aurora',
    rule: {
      locale: /^cs/i,
      updateChannel: /^aurora/i
    },
    urls: [
      "https://qsurvey.mozilla.com/s3/Developer-Tools-Language?sglocale=cs"
    ],
    breaks: asBreaks([1])
  },
  {
    alias: '^de, Aurora',
    rule: {
      locale: /^de/i,
      updateChannel: /^aurora/i
    },
    urls: [
      "https://qsurvey.mozilla.com/s3/Developer-Tools-Language?sglocale=de"
    ],
    breaks: asBreaks([1])
  },
  {
    alias: '^es, Aurora',
    rule: {
      locale: /^es/i,
      updateChannel: /^aurora/i
    },
    urls: [
      "https://qsurvey.mozilla.com/s3/Developer-Tools-Language?sglocale=es"
    ],
    breaks: asBreaks([1])
  },
  {
    alias: '^fr, Aurora',
    rule: {
      locale: /^fr/i,
      updateChannel: /^aurora/i
    },
    urls: [
      "https://qsurvey.mozilla.com/s3/Developer-Tools-Language?sglocale=fr"
    ],
    breaks: asBreaks([1])
  },
  { //TODO(gregglind)
    alias: '^it, Aurora',
    rule: {
      locale: /^it/i,
      updateChannel: /^aurora/i
    },
    urls: [
      "https://qsurvey.mozilla.com/s3/Developer-Tools-Language?sglocale=it"
    ],
    breaks: asBreaks([1])
  },
//  {
//    alias: '^en, release',
//    rule: {
//      locale: /^en/i,
//      updateChannel: /^release/i
//    },
//    urls: [
//    ],
//    breaks: []
//  },
//
//  // en-*, general
//  {
//    alias: '^en',
//    rule: {
//      locale: /^en/i
//    },
//    urls: [
//    ],
//    breaks: [
//    ]
//  },
//  // de
//  {
//    alias: 'de',
//    rule: {
//      locale: 'de'
//    },
//    urls: [
//    ],
//    breaks: [
//    ]
//  },
  {
    alias: 'no match',
    rule: {
    },
    urls: [
    ],
    breaks: [
    ]
  }

  // other
];

let supportedLocales = [
  'cs',
  'de',
  'en-US',
  'en-GB',
  'es',
  'es-ES',
  'es-MX',
  'fr',
  'it',
  'zh-CN',
];

const localeMultiplier = { //TODO: Remove this hacky, temp code
  "cs":    50,
  "de":    5,
  "es-ES": 5,
  "es-MX": 5,
  "fr":    5,
  "it":    25
};

/** convert array of positive numbers to a 'breaks' array
  *
  * ratios: array of length N of positive numbers, expressing proportions for each group
  *
  * returns: 'breaks' array such that
  *   - length N
  *   - monotonically increasing
  *   - last element is 1
  *   - scaled cumulative sum of ratios
  */
function asBreaks(ratios) {
  if (ratios.length < 1) throw new Error("must have entries")
  if (ratios.some((x) => typeof x !== 'number')) throw new Error("all must be numbers")
  if (ratios.some((x) => x <= 0)) throw new Error("all must be positive")
  var t = ratios.reduce((x,y) => x+y)
  for (var cumsum = [ratios[0]], i = 0, l = ratios.length-1; i<l; i++)
      cumsum[i+1] = cumsum[i] + ratios[i+1];
  return cumsum.map((x) => x/t)
}

module.exports = {
  VERSION: VERSION,

  engagementRules: engagementRules,

  sampling:  {
    "nightly": {
      restdays: 30,
      sample:   1 / thousand,  // 1 of 1000
      locales:  supportedLocales
    },
    "aurora": {
      "localeMultiplier": localeMultiplier, //TODO: Remove this hacky, temp code
      restdays: 30,
      sample:   2 / thousand,  // 1 in 500
      locales:  supportedLocales
    },
    "beta": {
      restdays: 30,
      sample:   400 / million,  // 1 in 2500
      locales:  supportedLocales
    },
    "release": {
      restdays: 30,
      sample:   100 / million,  // 1 in 10000
      locales:  supportedLocales
    }
  },
  supportedLocales: supportedLocales,
  filterFields: filterFields
};
