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

let uuid       = require("node-uuid").v4;
let events     = require("../../common/events");

let { hasAny } = require("../../jetpack/array");

let UITour     = require("thirdparty/uitour");

let { Flow, phonehome } = require("../../common/heartbeat/");
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


//Gets a random branch (even distribution)
let chooseBranch = function(branches, rng=Math.random() ) {
  let num_branches = branches.length;
  for (var i = 1; i <= num_branches ; i++) {
    if (rng < (i/(num_branches))) {
      return branches[i-1];
    }
  }
  return branches[num_branches-1];
};

const BRANCH        = chooseBranch(configFile.studies);
const NAME          = BRANCH.key;
const VARIATION     = BRANCH.name;
const VERSION       = BRANCH.version;
const DELAY         = BRANCH.delay;
const KEY           = BRANCH.key;  //  'ios-promo'.  keys localstore
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
  if (! eData.data.uuid)    eData.data.uuid    = uuid(); // used for repeat sample targeting, NOT sent server-side

  eData.store();

  return eData;
};

// module level
var eData = setupState();

// ELIGIBLE.  parts of the eligibility, made explicit for testability

// is dayspassed >= restDays
let waitedEnough = function (restDays, last, now) {
  now = now || Date.now();
  let dayspassed = ((now - last)/days);
  return dayspassed >= restDays ;
};

// if input is random and long this should return an suitably even hash
let stringNumberGenerator = function (input, modulo = 100) {
  let total = 0;
  for ( var i = 0; i < input.length; i++ ) {
    total += input.charCodeAt(i);
  }
  return (total % modulo) / modulo;
};

// OH BOY.  This is scary :)
let isAustralia = function () {
  var current_date = new Date( );
  var gmt_offset = current_date.getTimezoneOffset( ) / 60;
  return  ( -11 <= gmt_offset ) && (gmt_offset <= -8  )
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

  config = config || configFile.channels.all;
  if (!config) {
    events.message(NAME, "no-config", {});
    return false;
  }
  extras = extras || {};
  let now = extras.when || Date.now();
  //let channel = userstate.updateChannel || extras.updateChannel;
  let lastRun = extras.lastRun || data.lastRun || 0;
  let locale = (extras.locale || userstate.locale || "unknown").toLowerCase();
  let restdays = config.restdays; // Only run once
  let locales = (config.locales || []).map((x)=>x.toLowerCase());

  let geoAus= extras.geoAus || isAustralia();

  // bad version.
  let shortVersion = 1 * (userstate.fxVersion.match(/^[0-9]+/) || 0);
  if (shortVersion < 41) { // TODO: Represent this in config long-term
    events.message(NAME, "bad-version", {shortVersion: shortVersion});
    return false;
  }

  //// Bad locale
  //console.log({
  //  now: now,
  //  lastRun: lastRun,
  //  locale: locale,
  //  restdays: restdays,
  //  locales: locales//,
  //  //geoAus: geoAus
  //});

  if (!hasAny(locales, [locale, "*"])) {
    events.message(NAME, "bad-locale", {locale: locale, locales: locales});
    return false;
  }
  // Already ran this
  if (lastRun !== 0) { // This recipe is only showed once
    events.message(NAME, "already-run", {lastRun: lastRun});
    return false;
  }

  let sample = config.sample;
  if (geoAus) { // Override sample if AUS
    sample = 1.0;
  }

  // Sample based on uuid
  let myRng  = extras.randomNumber !== undefined ? extras.randomNumber : stringNumberGenerator(data.uuid);
  //let myRng = extras.randomNumber !== undefined ? extras.randomNumber : Math.random();

  if (myRng <= sample) {
    return true;
  } else {
    events.message(NAME, "bad-random-number", {randomNumber: myRng});
    return false;
  }
};

// run / do
let run = function (state, extras = {}) {
  // TODO: We may target different messages by OS / Channel

  let now = extras.when || Date.now();
  let delay = extras.delay || DELAY;
  let branch = extras.branch || BRANCH.branch;

  let geoAus= extras.geoAus || isAustralia();

  eData.data.lastRun = now;
  eData.store();

  let flowid = extras.flow_id || uuid();
  let local = {
    flow_id: flowid,
    variation_id: branch.name,
    survey_id: NAME
  };

  let storeFlow = function (flow_id, flow) {
    eData.data.flows[flow_id] = flow.data;
    eData.store();
  }.bind(null, local.flow_id);

  /* Commented b/c we will use Telemetry instead of phonehome
     and assume 100% of all users in locale sampled.

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

  // make and setup flow
  let flow = new Flow(local);  // create and update
  flow.began();
  // maybePhonehome(flow);

  storeFlow(flow);
  events.message(local.flow_id, "began", flow.data);

  // Add parameters to url
  let fullUrl = `${branch.url}?source=hb&hbv=${VERSION}` +
      `&c=${state.updateChannel}&v=${state.fxVersion}&l=${state.locale}` +
      `&b=${branch.name}&g=${geoAus}`;
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
  return Promise.resolve(local.flow_id);
};

exports.name        = NAME; // BRANCH.name;
exports.description = 'Marketing promo for iOS'; // "Marketing-" + BRANCH.name;
exports.shouldRun   = shouldRun;
exports.run         = run;
exports.owner       = "Robert Rayborn <rrayborn@mozilla.com>";
exports.version     = VERSION;

exports.config      = config;

exports.branchConfig = configFile;

// extras that we want for testing
// TODO:  these should spin off into another module, by v.11
exports.testable = {
  waitedEnough: waitedEnough,
  eData: eData,
  setupState: setupState
};
