/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/. */

/*jshint forin:true, noarg:false, noempty:true, eqeqeq:true, bitwise:true,
  strict:true, undef:true, curly:false, browser:true,
  unused:true, indent:2, maxerr:50, devel:true, node:true, boss:true, white:true,
  globalstrict:true, nomen:false, newcap:true, esnext: true, moz: true  */

/*global require, exports */


"use strict";
let common     = require("../../common");
let configFile = require("./config");
let actions    = common.actions;
let log        = actions.log.bind(actions.log, "pb-mode-survey");

let uuid       = require("node-uuid").v4;
let events     = require("../../common/events");

let { hasAny } = require("../../jetpack/array");

let UITour     = require("thirdparty/uitour");

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
let days = 24 * 60 * 60 * 1000;

const BRANCH        = configFile.study.branch;
const NAME          = configFile.study.name;
const VERSION       = configFile.study.version;
const DELAY         = configFile.study.delay;
const KEY           = configFile.study.key;
//const PHONEHOMEPCT = configFile.study.phonehomepct

let config = {
  lskey:     KEY,
  survey_id: KEY
};

// setup state?

/*eData = {
  data: {
    flows: {},
    lastRun: number
  }
},
*/

var setupState = function (key, storage) {
  key     = key || config.lskey;
  storage = storage || localStorage;

  var eData = new Lstore(key, storage).revive().store();  // create or revive

  if (! eData.data.flows)   eData.data.flows   = {};
  if (! eData.data.lastRun) eData.data.lastRun = 0;

  eData.store();

  return eData;
};

// module level
var eData = setupState();

// ELIGIBLE.  parts of the eligibility, made explicit for testability

/* For this survey we're testing to see if it's ever been seen
// is dayspassed >= restDays
let waitedEnough = function (restDays, last, now) {
  now = now || Date.now();
  let dayspassed = ((now - last)/days);
  return dayspassed >= restDays ;
};
*/

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

  config = config || configFile.channels.all;
  if (!config) {
    events.message(NAME, "no-config", {});
    return false;
  }

  extras = extras || {};
  let now = extras.when || Date.now();
  //let channel = userstate.updateChannel || extras.updateChannel;
  let lastRun = extras.lastRun || eData.lastRun || 0;
  let locale = (userstate.locale || extras.locale || "unknown").toLowerCase();
  //let restdays = config.restdays; // Only run once
  let locales = (config.locales || []).map((x)=>x.toLowerCase());

  // All versions

  // Bad locale
  if (!hasAny(locales, [locale, "*"])) {
    events.message(NAME, "bad-locale", {locale: locale, locales: locales});
    return false;
  }

  // Already ran this
  if (lastRun !== 0) { // This recipe is only showed once
    events.message(NAME, "already-run", {lastRun: lastRun});
    return false;
  }

  /* For this survey we're testing to see if it's ever been seen
  // Another survey was run recently
  if (!waitedEnough(restdays, lastRun, now)) {
    events.message(NAME, "too-soon", {restdays: restdays, lastRun: lastRun, now: now});
    return false;
  }*/

  // Sample
  let myRng = extras.randomNumber !== undefined ? extras.randomNumber : Math.random();

  if (myRng <= config.sample) {
    return true;
  } else {
    events.message(NAME, "bad-random-number", {randomNumber: myRng});
    return false;
  }
};

// run / do
let run = function (state, extras) {
  // TODO: We may target different messages by OS / Channel

  extras = extras || {};
  let now = extras.when || Date.now();
  let delay = extras.delay || DELAY;

  eData.data.lastRun = now;
  eData.store();


  let flowid = extras.flow_id || uuid();
  let local = {
    flow_id: flowid,
  };

  let storeFlow = function (flow_id, flow) {
    eData.data.flows[flow_id] = flow.data;
    eData.store();
  }.bind(null, local.flow_id);

  /* Using Telemetry instead of phonehome
  let maybePhonehome = function (flow) {
    if (!extras.simulate) {
      let myRng = ;
      if (Math.random() < PHONEHOMEPCT) {
        phonehome(flow.data);
        events.message(flowid, "attempted-phonehome", flow.data);
      } else {
        events.message(flowid, "attempted-phonehome", flow.data);
      }
    } else {
      events.message(flowid, "simulated-phonehome", flow.data);
    }
  };

  // make and setup flow
  let flow = new Flow(local);  // create and update
  flow.began();
  maybePhonehome(flow);
  */

  storeFlow({data:{}});
  events.message(local.flow_id, "began", {});

  // Add parameters to url
  let fullUrl = BRANCH.url + `?source=hb&hbv=${VERSION}&c=${state.updateChannel}&v=${state.fxVersion}&l=${state.locale}&b=${BRANCH.name}`;
  setTimeout(function() {
    UITour.showHeartbeat(
      BRANCH.prompt,
      BRANCH.thankyou,
      flowid,
      fullUrl,
      null, // learn more text, TODO: should this be "What's this?" or something?
      null, // learn more link
      {
        engagementButtonLabel: BRANCH.button
      }
    )},
    delay
  );
  return Promise.resolve(local.flow_id);
};

exports.name        = KEY; // BRANCH.name;
exports.description = 'Marketing promo'; // "Marketing-" + BRANCH.name;
exports.shouldRun   = shouldRun;
exports.run         = run;
exports.owner       = "Robert Rayborn <rrayborn@mozilla.com>";
exports.version     = VERSION;

exports.config      = config;
// extras that we want for testing
// TODO:  these should spin off into another module, by v.11
exports.testable = {
//  waitedEnough: waitedEnough,//For this survey we're testing to see if it's ever been seen
  eData: eData,
  setupState: setupState
};
