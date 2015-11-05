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
let log = actions.log.bind(actions.log, "pb-mode-survey-germany");

let { Flow, phonehome } = require("../../common/heartbeat/");
let phConfig = phonehome.config;
phonehome = phonehome.phonehome;

let uuid = require("node-uuid").v4;
let events = require("../../common/events");

let { hasAny } = require("../../jetpack/array");

let UITour = require("thirdparty/uitour");

let { Lstore } = require("../../common/recipe-utils");


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

const NAME="pb-mode-survey-germany";
const VERSION=2;

let config = {
  lskey : 'pb-mode-survey-germany',
  survey_id : "pb-mode-survey-germany",
};

const days = 24 * 60 * 60 * 1000;

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
  extras = extras || {};
  let now = extras.when || Date.now();
  let channel = userstate.updateChannel || extras.updateChannel;
  let lastRun = extras.lastRun || eData.lastRun || 0;
  let locale = (userstate.locale || extras.locale || "unknown").toLowerCase();

  config = config || allconfigs[channel];
  if (!config) {
    events.message(NAME, "no-config", {});
    return false;
  }

  let restdays = config.restdays;
  let locales = (config.locales || []).map((x)=>x.toLowerCase());

  // bad version.
  let shortVersion = 1 * (userstate.fxVersion.match(/^[0-9]+/) || 0);
  if (shortVersion < 41) {
    events.message(NAME, "bad-version", {shortVersion: shortVersion});
    return false;
  }

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
let run = function (state, extras) {
  extras = extras || {};
  eData.data.lastRun = extras.when || Date.now();
  eData.store();

  let flowid = extras.flow_id || uuid();
  let local = {
    flow_id: flowid,
  };

  let storeFlow = function (flow_id, flow) {
    eData.data.flows[flow_id] = flow.data;
    eData.store();
  }.bind(null, local.flow_id);

  storeFlow({data:{}});
  events.message(local.flow_id, "began", {});

  // https://bugzilla.mozilla.org/show_bug.cgi?id=1196104#c2
  UITour.showHeartbeat(
    "Möchten Sie an einer Umfrage teilnehmen um Firefox zu verbessern?",
    "Vielen Dank dass Sie an der Umfrage teilgenommen haben. Ihre Antworten helfen uns dabei Firefox zu verbessern.",
    flowid,
    `http://qsurvey.mozilla.com/s3/PBM-Survey-Genpop-41-German?source=pb-mode-survey&surveyversion=${VERSION}&updateChannel=${state.updateChannel}&fxVersion=${state.fxVersion}`,
    null, // learn more text
    null, // learn more link
    {
      engagementButtonLabel: "Teilnehmen",
      privateWindowsOnly: true,
    }
  );
  return Promise.resolve(local.flow_id);
};

exports.name = NAME;
exports.description = `Private Browser Mode (no phone home) survey launcher.
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
