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

const VERSION=11;

const million = Math.pow(10,6);
const thousand = Math.pow(10,3);
const percent = 0.01;
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

/*
    URL: http://qsurvey.mozilla.com/s3/Firefox-User-Satisfaction
    Respondants: 1000ish
    Channels: All channels
    Distribution: EN*
    Launch Date: 2016/02/01
    Duration: A week max
    Prompt: No star rating. Instead we will use the following language. "Would you like to share feedback with Mozilla?"


  UITour.showHeartbeat(
    "Would you like to share feedback with Mozilla?",
    "Thank you!",
    flowid,
    `http://qsurvey.mozilla.com/s3/Private-Browsing-Survey?source=pb-mode-survey&surveyversion=${VERSION}&updateChannel=${state.updateChannel}&fxVersion=${state.fxVersion}`,
    null, // learn more text
    null, // learn more link
    {
      engagementButtonLabel: "Take Survey",
      privateWindowsOnly: true,
    }
  );

  setTimeout(function() {
    UITour.showHeartbeat(
      branch.prompt,
      branch.thankyou,
      flowid,
      fullUrl,
      null, // learn more text, TODO: should this be "What's this?" or something?
      null, // learn more link
      {
        engagementButtonLabel: branch.button
      }
    )},
    delay
  );

*/

// aliases for MESSAGE CONFIG.  Only need to define overrided fields.
// TODO, add messageGroup concept, for excluding recent

let messages = {

  // issue #226
  "en-user-satisfaction-2": {
    prompt:  "Would you like to share feedback with Mozilla?",
    thankyou: "Thank you!",
    url:      "https://qsurvey.mozilla.com/s3/Firefox-User-Satisfaction",
    button:   "Take Survey",
  },

  "ios-promo-bookmarks": {
    prompt:   "Bring your bookmarks & passwords with you. Firefox is now on iOS & Android.",
    thankyou:  "We hope that you enjoy Firefox on your mobile device!",
    url:      "https://www.mozilla.org/en-US/firefox/mobile-download/",
    button:   "Get it now"
  }
};


// names them all by key, shortcut.
for (let k in messages) { messages[k].name = k }

// ENROLLMENT RULES
let rules = [
  {
    alias: '^en',
    rule: {
      locale: /^en/i
    },
    choices: [
      messages['en-user-satisfaction-2']
    ],
    breaks: asBreaks([1])
  },
]


let supportedLocales = [ 'de',
  'en-US',
  'en-GB',
  'es',
  'es-ES',
  'es-MX',
  'fr',
  'zh-CN',
];

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

  rules: rules,

  sampling:  {
    "nightly": {
      restdays: 30,
      sample: 1 / thousand,  // 1 of 1000
      locales: supportedLocales
    },
    "aurora": {
      restdays: 30,
      sample: 20 * percent * percent,  // 1 in 500
      locales: supportedLocales
    },
    "beta": {
      restdays: 30,
      sample: 4 * percent * percent,  // 1 in 2500
      locales: supportedLocales
    },
    "release": {
      restdays: 30,
      sample: 10 * 10/million,  // 1 in 10000
      locales: supportedLocales
    }
  },
  supportedLocales: supportedLocales,
  filterFields: filterFields
};
