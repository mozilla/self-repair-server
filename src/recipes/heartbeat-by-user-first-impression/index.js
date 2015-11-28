/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/. */

/*jshint forin:true, noarg:false, noempty:true, eqeqeq:true, bitwise:true,
  strict:true, undef:true, curly:false, browser:true,
  unused:true, indent:2, maxerr:50, devel:true, node:true, boss:true, white:true,
  globalstrict:true, nomen:false, newcap:true, esnext: true, moz: true  */

/*global require, exports */


"use strict";
let common = require("../../common");
let allconfigs = require("./config");
let actions  = common.actions;
let log = actions.log.bind(actions.log, "heartbeat-by-user-first-impression");

let { Flow, phonehome } = require("../../common/heartbeat/");
let { Lstore } = require("../../common/recipe-utils");

let phConfig = phonehome.config;
phonehome = phonehome.phonehome;

let uuid = require("node-uuid").v4;
let events = require("../../common/events");

let { hasAny } = require("../../jetpack/array");

// TODO, is it module level config, or function level?
// so far, 3 systems
// - module.config
// - function config
// - external 'sampling config'

/*
  Full description:

  - Should wait some period between requests
  - will only get people on the first impression (initial startup of a session)

     - no try
     - no 24-ish

  - different sample percentages for differnt channels.
  - different 'wait between' guarantees?

*/

const NAME="heartbeat by user v1";
const VERSION=27;

let config = {
  lskey : 'heartbeat-by-user-first-impressions',
  survey_id : "heartbeat-by-user-first-impression",
};


const days = 24 * 60 * 60 * 1000;


let translations = require('../../localeStrings');


// setup state?

var setupState = function (key, storage) {
  key = key || config.lskey;
  storage = storage || localStorage;
  var eData = new Lstore(key, storage).revive().store();  // create or revive
  if (! eData.data.flows) eData.data.flows = {};
  if (! eData.data.lastRun) eData.data.lastRun = 0;
  eData.store();
  return eData;
};

// module level
var eData = setupState();

// ELIGIBLE.  parts of the eligibility, made explicit for testability

/* is dayspassed >= restDays
*/
let waitedEnough = function (restDays, last, now) {
  now = now || Date.now();
  let dayspassed = ((now - last)/days);
  return dayspassed >= restDays ;
};

/** run or not, given configs?
  *
  * Args:
  *
  * userstate
  * - updateChannel
  *
  * config (optional)
  * - alt config to use, needs
  *   - sample
  *   - restdays
  *
  * extras: for testing  (optional)
  * - when
  * - updateChannel (to use with allconfigs)
  * - lastRun (replace eData.lastRun).  epoch_ms
  * - randomNumber (0,1)
  */
let shouldRun = function (userstate, config, extras) {
  let data = eData.data; // Until we have better testing, point directly to data

  extras = extras || {};
  let now = extras.when || Date.now();
  let channel = userstate.updateChannel || extras.updateChannel;
  let lastRun = extras.lastRun || data.lastRun || 0;
  let locale = (userstate.locale || extras.locale || "unknown").toLowerCase();

  config = config || allconfigs[channel];
  if (!config) {
    events.message(NAME, "no-config", {});
    return false;
  }

  let restdays = config.restdays;
  let locales = (config.locales || []).map((x)=>x.toLowerCase());

  if (!hasAny(locales, [locale, "*"])) {
    events.message(NAME, "bad-locale", {locale: locale, locales: locales});
    return false;
  }

  if (!waitedEnough(restdays, lastRun, now)) {
    events.message(NAME, "too-soon", {restdays: restdays, lastRun: lastRun, now: now});
    return false;
  }

  let myRng = extras.randomNumber !== undefined ? extras.randomNumber : Math.random();

  if (myRng <= config.sample) {
    return true;
  } else {
    events.message(NAME, "bad-random-number", {randomNumber: myRng});
    return false;
  }
};

// run / do
/* */
// TODO, audit 'extras'
let run = function (state, extras) {
  extras = extras || {};
  eData.data.lastRun = extras.when || Date.now();
  eData.store();

  let locale = (state.locale || "UNK").toLowerCase();
  let trans = translations.getTranslation(locale).heartbeat;

  let question_text = trans.question_text();
  let learnmore = trans.learnmore();
  let thankyou = trans.thankyou();

  let flowid = extras.flow_id || uuid();
  let local = {
    flow_id: flowid,
    max_score: 5,
    question_id: "Please rate Firefox" ,
    question_text:  question_text,
    survey_id: "heartbeat-by-user-first-impression",
    variation_id:  "" + VERSION,  // wants a string
    locale: locale
  };

  let learnmoreUrl = "https://wiki.mozilla.org/Advocacy/heartbeat";

  let storeFlow = function (flow_id, flow) {
    eData.data.flows[flow_id] = flow.data;
    eData.store();
  }.bind(null, local.flow_id);

  let maybePhonehome = function (flow) {
    if (!extras.simulate) {
      phonehome(flow.data);
      events.message(flowid, "attempted-phonehome", flow.data);
    } else {
      events.message(flowid, "simulated-phonehome", flow.data);
    }
  };

  // make and setup flow
  let flow = new Flow(local);  // create and update
  flow.began();
  maybePhonehome(flow);

  storeFlow(flow);
  events.message(local.flow_id, "began", flow.data);

  let phaseCallback = function phaseCallback (flowid, action, data) {
    let msg = action.split(":")[1].toLowerCase().replace("notification","");
    switch (msg) {
      case "offered":
      case "voted":
      case "learnmore": {
        if (msg === "learnmore") { // abuse the existing 'link' field
          flow.link(learnmoreUrl, "notice");
        } else {
          flow[msg](data.timestamp);
        }

        if (msg === "voted") {
          flow.data.score = data.score;
          eData.data.lastScore = data.score;
          eData.store();
          events.message(NAME, 'new-score', {score: data.score});
        }

        storeFlow(flow);
        maybePhonehome(flow);
        events.message(flowid, msg, flow.data);
        break;
      }
      default:
        // TODO, this should log
        events.message(flowid, 'unexpected-tour-message', {msg: msg});
        break;
    }
  };

  //      updateChannel:  "unkown",
  //    fxVersion: "unknown",

  // as shown below, this is en-us only!
  //let engagementUrl =  `https://www.mozilla.org/en-US/firefox/feedback/?updateChannel=${state.updateChannel}&fxVersion=${state.fxVersion}`;  //"http://localhost/enagement.html",

  let eUrls = [
    // `https://qsurvey.mozilla.com/s3/68ffc1dd1d8b?source=heartbeat&surveyversion=${VERSION}&updateChannel=${state.updateChannel}&fxVersion=${state.fxVersion}`,
    // `https://qsurvey.mozilla.com/s3/Firefox-USE-Survey?source=heartbeat&surveyversion=${VERSION}&updateChannel=${state.updateChannel}&fxVersion=${state.fxVersion}`,
    `https://qsurvey.mozilla.com/s3/PBM-Survey-Genpop-41?source=heartbeat&surveyversion=${VERSION}&updateChannel=${state.updateChannel}&fxVersion=${state.fxVersion}`,
    // `https://qsurvey.mozilla.com/s3/Heartbeat-Bright-Spots?source=heartbeat&surveyversion=${VERSION}&updateChannel=${state.updateChannel}&fxVersion=${state.fxVersion}`
  ];

  let cutBreaks = function (arr, breaks, rng=Math.random()) {
    // should have tests, gah!  was not ready to deal with this yet.
    // should have way of overring rng too
    let out;
    for (let ii = 0; ii < breaks.length; ii++) {
      if (rng <= breaks[ii]) {
        return arr[ii];
      }
    }
  };

  let breaks = [1.0];



  //ad-hoc for germany survey
  var getEngagementUrl = function(locale) {
    if (locale == "de") {
      return null
      // return `https://qsurvey.mozilla.com/s3/PBM-Survey-Genpop-41-German?source=pb-mode-survey&surveyversion=${VERSION}&updateChannel=${state.updateChannel}&fxVersion=${state.fxVersion}`
    }
    if (/^en-/.test(locale)) {
      return cutBreaks(eUrls, breaks)
    }
    return
  }

  let engagementUrl = getEngagementUrl(locale);
  if (phConfig.testing && engagementUrl) {
    engagementUrl = engagementUrl + "&testing=1"; // only if testing.
  }

  actions.showHeartbeat(
    local.flow_id,
    local.question_text,
    thankyou,
    engagementUrl || null, // already checked locale
    learnmore,  // learn more text
    learnmoreUrl,  // learn more link
    phaseCallback
  );

  return Promise.resolve(local.flow_id);
};

exports.name = NAME;
exports.description = `Heartbeat User First Impressions

Samples over USERS once per sessions, at 5 minutes after
session startup.
`;
exports.shouldRun = shouldRun;
exports.run = run;
exports.owner = "Gregg Lind <glind@mozilla.com>";
exports.version = VERSION;

exports.config = config;
// extras that we want for testing
// TODO:  these should spin off into another module, by v.11
exports.testable = {
  waitedEnough: waitedEnough,
  eData: eData,
  setupState: setupState
};

