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

let uuid       = require("uuid").v4;
let events     = require("../../common/events");

let { hasAny } = require("../../jetpack/array");
const { extend } = require("../../jetpack/object");

let UITour     = require("thirdparty/uitour");

let { Flow, phonehome } = require("../../common/heartbeat/");
let phConfig = phonehome.config;

let { getMessage, setupState, waitedEnough } = require("./utils");

const VERSION = configFile.VERSION;
const NAME="Messaging with external links";
const DESCRIPTION = `Messages with External Links

- show messages to users
- remember which messages have already been seen
- don't show too many messages (allow resting)
- messages should be well-targeted

`

/*
  Flow:

  - user opens recipe
  - user is enrolled in *any message*?
  - user gets a particular message, at most one
  - done.

*/

const days = 24 * 60 * 60 * 1000;

let config = {
  lskey:     "messaging",
};

// module level
var eData = setupState(config.lskey);

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

  let channel = userstate.updateChannel || extras.updateChannel;
  config = config || configFile.sampling[channel];
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

  // 41+ is needed to see these kind of messages
  let shortVersion = 1 * (userstate.fxVersion.match(/^[0-9]+/) || 0);
  if (shortVersion < 41) { // TODO: Represent this in config long-term
    events.message(NAME, "bad-version", {shortVersion: shortVersion});
    return false;
  }
  // from here on out, looks like hb-1st-impression

  if (!hasAny(locales, [locale, "*"])) {
    events.message(NAME, "bad-locale", {locale: locale, locales: locales});
    return false;
  }
  // Already ran this
  if (lastRun !== 0) { // This recipe is only showed once
    events.message(NAME, "already-run", {lastRun: lastRun});
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
let run = function (state, extras = {}) {
  // TODO: We may target different messages by OS / Channel
  let now = extras.when || Date.now();
  let locale = (state.locale || "UNK").toLowerCase();

  eData.data.lastRun = now;
  eData.store();

  let flowid = extras.flow_id || uuid();

  let eOpts = extend(state, {VERSION: VERSION, locale: locale})
  let message = getMessage(eOpts, configFile.rules); // will be a COPY of the obj.

  // nothing to show
  if (!message) {
    return Promise.resolve(flowid); // return early.
  }

  // this is gross, but needful somewhere.
  // cant do it at shouldRun, b/c we don't know which message to show.
  if (message.name in eData.data.seen) {
    return Promise.resolve(flowid)  // return early!
  } else {
    eData.data.seen[message.name] = Date.now();
  }

  let local = {
    flow_id: flowid,
    variation_id: message.name,
    survey_id: message.name
  };

  let storeFlow = function (flow_id, flow) {
    eData.data.flows[flow_id] = flow.data;
    eData.store();
  }.bind(null, local.flow_id);


  // make and setup flow
  let flow = new Flow(local);  // create and update
  flow.began();

  storeFlow(flow);
  events.message(local.flow_id, "began", flow.data);

  if (phConfig.testing && message.url) {
    message.url = message.url + "&testing=1"; // only if testing.
  }

  // UNIFIED TELEMETRY: https://hg.mozilla.org/mozilla-central/rev/7b81b08f1899
  // https://bugzilla.mozilla.org/show_bug.cgi?id=1193535
  let extraTelemetryArgs = {
      surveyId: local.survey_id,
      surveyVersion: local.variation_id,
  }
  if (phConfig.testing) {extraTelemetryArgs.testing = 1}

  let extraArgs = extend(extraTelemetryArgs, {
    engagementButtonLabel: message.button,
    privateWindowsOnly: message.privateWindowsOnly
  })

  // Prompt with label
  UITour.showHeartbeat(
    message.prompt,
    message.thankyou,
    flowid,
    message.url,
    null, // learn more text, TODO: should this be "What's this?" or something?
    null, // learn more link
    extraArgs
  )
  return Promise.resolve(local.flow_id);
};

exports.name        = NAME;
exports.description = DESCRIPTION
exports.shouldRun   = shouldRun;
exports.run         = run;
exports.owner       = "Gregg Lind <glind@mozilla.com>";
exports.version     = VERSION;

exports.config      = config;

// extras that we want for testing
// TODO:  these should spin off into another module, by v.11
exports.testable = {
  waitedEnough: waitedEnough,
  eData: eData,
  setupState: setupState
};



