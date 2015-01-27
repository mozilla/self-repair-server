/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/. */

/*jshint forin:true, noarg:false, noempty:true, eqeqeq:true, bitwise:true,
  strict:true, undef:true, curly:false, browser:true,
  unused:true, indent:2, maxerr:50, devel:true, node:true, boss:true, white:true,
  globalstrict:true, nomen:false, newcap:true, esnext: true, moz: true  */

/*global require, exports */


"use strict";
let common = require("../common");
let allconfigs = require("./config");
let actions  = common.actions;
let log = actions.log.bind(actions.log, "heartbeat-by-user-first-impression");

let Flow = require("../common/heartbeat-flow").Flow;
let phonehome = require("../common/heartbeat-phonehome").phonehome;

/*
  Full description:

  - Should wait some period between requests
  - will only get people on the first impression (initial startup of a session)

     - no try
     - no 24-ish

  - different sample percentages for differnt channels.
  - different 'wait between' guarantees?

*/

log("module name", module.name);
let lskey = exports.lskey = ['heartbeat-by-user-first-impressions'];
let survey_id = "heartbeat-by-user-first-impression";

let days = 24 * 60 * 60 * 1000;


// UTILITIES  // TODO, move?

/**
  usage:

    var state = new Lstore("m");
    state.data   // mostly a normal-ish obj
    state.store()
    state.revive()

*/
let Lstore = function (key, storage) {
  this.key = key;
  this.data = {};
  return {
    store:  function () {
      storage[this.key] = JSON.stringify(this.data);
      return this;
    },
    revive: function () {
      this.o = JSON.parse(storage[this.key] || "{}");
      return this;
    },
    data: this.data
  };
};

function newId () {
  return "flow-" + Math.floor(Math.random() * 100000);
}

// setup state?

var setupState = function (key, storage) {
  key = key || lskey;
  storage = storage || localStorage;
  var eData = new Lstore(storage, key).revive();  // create or revive
  if (! eData.flows) eData.flows = [];
  if (! eData.lastRun) eData.lastRun = 0;
  return eData;
};

// module level
var eData = setupState();

// ELIGIBLE.  parts of the eligibility, made explicit for testability

/* */
let botheredRecently = function (restDays, last) {
  return (Date.now() - last)/days  > restDays ;
};

/* */
let shouldRun = function (userstate, config) {
  let channel = userstate.updateChannel;
  config = config || allconfigs[channel];

  if (!config) {
    log("no config for", channel, allconfigs);
    return false;
  }

  if (botheredRecently(config.restdays, eData.lastRun)) {
    log("bothered too recently", config.restdays, eData.lastRun, (Date.now() - eData.lastRun)/days );
    return false;
  }

  // store this?  if so, why?  To override?
  let myRng = Math.random();
  if (myRng <= config.sample) {
    log("running!  rng small", myRng);
    //recordAttempt();  // async?
    return true;
  } else {
    log("not running!, wrong rng", myRng);
  }
};

// run / do
/* */
let recipe = function (state, callback) {
  // do I want to handle args and arity here?
  let local = {
    flow_id: newId(),
    max_score: 5,
    question_id: "Please Rate Firefox" ,
    question_text:  "Please Rate Firefox",
    survey_id: "heartbeat-by-user-first-impression",
    variation_id: "test"
  };

  // make and setup flow
  let flow = new Flow(local);  // create and update
  flow.began();
  eData.flows[local.flow_id] = flow.data;

  let phaseCallback = function (flowid, action, data) {
    let log2 = log.bind(log,"phaseCallback");
    log2(arguments);
    let msg = action.split(":")[1].toLowerCase().replace("notification","");
    switch (msg) {
      case "offered":
      case "voted": {
        flow[msg](data.timestamp);
        if (data.score) flow.score = data.score;
        log2(JSON.stringify(flow.data, null, 2));
        phonehome(flow.data);
        break;
      }
      default:
        break;
    }
    // TODO do updates.
    // TODO phonehome
  };

  actions.showHeartbeat(
    local.flow_id,
    local.question_text,
    "http://localhost/enagement.html",
    phaseCallback
  );
  if (callback) {
    callback(true);
  }
};

exports.name = "heartbeat by user v1";
exports.description = "long description";
exports.shouldRun = shouldRun;
exports.eligible = shouldRun;
exports.steps = recipe;
exports.recipe = recipe;
exports.owner = "Gregg Lind <glind@mozilla.com>";

// extras that we want for testing
exports.testable = {
  botheredRecently: botheredRecently,
  Lstore: Lstore
};

