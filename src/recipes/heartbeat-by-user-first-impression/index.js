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
const VERSION=4;

let config = {
  lskey : 'heartbeat-by-user-first-impressions',
  survey_id : "heartbeat-by-user-first-impression",
};


const days = 24 * 60 * 60 * 1000;


// UTILITIES  // TODO, move?

/** Wrap localstore a bit.
  *
  *  usage:
  *
  *    var state = new Lstore("aLocalStoreKey");
  *    state.data   // mostly a normal-ish obj
  *    state.store()
  *    state.revive()
  *
  **/
var Lstore = function (key, storage) {
   if ( !(this instanceof Lstore) )
      return new Lstore(key, storage);

  // to do, proper object chain?
  this.key = key;
  this.data = {};
  storage = storage || localStorage;

  this.store = function () {
    storage[this.key] = JSON.stringify(this.data);
    return this;
  };
  this.revive = function () {
    this.data = JSON.parse(storage[this.key] || "{}");
    this.store();
    return this;
  };
  this.clear = function () {
    this.data={};
    this.store();
    return this;
  };
  this.revive().store(); // always comes started
  return Object.preventExtensions(this); // freezing would break clear/revive
};


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

  let flowid = extras.flow_id || uuid();
  let local = {
    flow_id: flowid,
    max_score: 5,
    question_id: "Please rate Firefox" ,
    question_text:  "Please rate Firefox",
    survey_id: "heartbeat-by-user-first-impression",
    variation_id:  "" + VERSION  // wants a string
  };

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
      case "voted": {
        flow[msg](data.timestamp);
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

  actions.showHeartbeat(
    local.flow_id,
    local.question_text,
    "Thank you!",
    null, //"http://localhost/enagement.html",
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
  Lstore: Lstore,
  eData: eData,
  setupState: setupState
};

