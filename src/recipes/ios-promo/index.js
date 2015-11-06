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
let allconfigs = require("./config");
let actions    = common.actions;
let log        = actions.log.bind(actions.log, "pb-mode-survey");

let { Flow, phonehome } = require("../../common/heartbeat/");
let phConfig   = phonehome.config;
phonehome      = phonehome.phonehome;

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

let thankyou = "We hope that you enjoy Firefox on your mobile device!";
let url      = "https://www-demo3.allizom.org/en-US/firefox/mobile-download/"; //TODO
let button   = "Get it now";

const BASE_NAME = "marketing";

let branches = [
  {
    name:     BASE_NAME + "_Tabs",
    prompt:   "Take your open tabs on the road with you when using Firefox for iOS and Android.",
    thankyou: thankyou,
    url:      url,
    button:   button
  },
  {
    name:     BASE_NAME + "_Mobile",
    prompt:   "Get Firefox on your iOS and Android devices.",
    thankyou: thankyou,
    url:      url,
    button:   button
  },
  {
    name:     BASE_NAME + "_Other",
    prompt:   "Bring your bookmarks & passwords with you. Firefox is now on iOS & Android.",
    thankyou: thankyou,
    url:      url,
    button:   button
  }
];

//Gets a random branch (even distribution)
let getbranch = function(branches) {
  let myRng = Math.random();
  let num_branches = branches.length;
  for (var i = 1; i <= num_branches ; i++) {
    if (myRng < (i/(num_branches))) {
      return branches[i-1];
    }
  }
};

const BRANCH     = getbranch(branches);
const NAME       = BRANCH.name;
const VERSION    = 1;
const DELAY      = 60*1000 * (1 + 4*Math.random()) // Delay the start by 1-5 minutes

let config = {
  lskey :     BASE_NAME,
  survey_id : BASE_NAME
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

  config = config || allconfigs.all;
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

  /*
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

  storeFlow({data:{}});
  events.message(local.flow_id, "began", {});

  // Add parameters to url
  let fullUrl = BRANCH.url + `?source=hb&hbv=${VERSION}&c=${state.updateChannel}&v=${state.fxVersion}&l=${state.locale}`;
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

// TODO: If this is not phoned home, remove the branch logic
exports.name        = BRANCH.name; //BASE_NAME
exports.description = "Marketing-" + BRANCH.name; //Marketing
exports.shouldRun   = shouldRun;
exports.run         = run;
exports.owner       = "Robert Rayborn <rrayborn@mozilla.com>";
exports.version     = VERSION;

exports.config      = config;
// extras that we want for testing
// TODO:  these should spin off into another module, by v.11
exports.testable = {
  waitedEnough: waitedEnough,
  eData: eData,
  setupState: setupState
};
