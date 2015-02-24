/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/. */

/*jshint forin:true, noarg:false, noempty:true, eqeqeq:true, bitwise:true,
  strict:true, undef:true, curly:false, browser:true,
  unused:true,
  indent:2, maxerr:50, devel:true, node:true, boss:true, white:true,
  globalstrict:true, nomen:false, newcap:true, esnext: true, moz: true  */

/*global require, console */

/**!
  About this module:

  Runner
  repair list // Should move?
  Main loop

  This is is the output target for webpack
*/


/**
  potential problems:
  - state actually isn't constant over run.  should we fix that. TODO.
  -

  Should be doing something smart to check lots of deps in one go?
  Maybe wait until addons list to get smarter about this?
  Or only run a subset of these recipes for each person each day?

  Do all recipe names need to be unique?  If so, why don't I define an obj instead of a list.


TODO?  Promises or callback as first arg?  Are we node?

*/


"use strict";

let actions = require("./common/actions");
let runner = require("./runner");
let personinfo = require("./common/personinfo");
let { phonehome } = require("./common/heartbeat/");  // configs only
let events = require("./common/events");
let { paramsToObj, guessLocale } = require("./common/client-utils");

let merge = require("./jetpack/object").merge;

// allow overrides of any part of the system at client runtime.
// TODO, decide useful ones!
let runtimeConfig = {};
if (typeof window !== "undefined") {
  runtimeConfig = paramsToObj(window.location.search);
}

// will only catch things from other windows
//if (window) {
//  window.addEventListener("storage", function (e) {
//    log("storage", key, oldValue, newValue, uri);
//  }, false);
//}

// TODO should this be gotten between every recipe?  This is async, right?
let state;

// is there a timer here? I dunno!
let mainloop = function (repairsList) {
  console.log("heartbeat main loop");
  runner.runAll(repairsList,
    personinfo.personinfo,
    null
  ).then(
    function () { actions.log("mainloop runAll callback"); }
  );
};


let guessedLocale = guessLocale();
if (guessedLocale) {
  personinfo.config.overrides.locale = guessedLocale;
} // use this locale first.

// process config.  TODO, use a lib for this?
for (let key in runtimeConfig) {
  // please be sensible here!
  let branch = runtimeConfig[key];
  console.log(key, branch);
  switch (key) {
    case "runner":
      merge(runner.config, branch);
      break;
    case "personinfo":
      merge(personinfo.config.overrides, branch);
      break;
    case "phonehome":
      merge(phonehome.config, branch);
      break;
    default:
      break;
  }
}
// actually run

let recipes = require("./repairs");

window.heartbeat = {
  actions: actions,
  runner: runner,
  personinfo: personinfo,
  recipes: recipes,
  events: events,
  main: mainloop
};


console.log('heartbeat loaded');
console.log('to start (if not started): `heartbeat.main(heartbeat.recipes)`');

// loop over the list?
// do them all?
// sync or async?
// ye gods it is Test Pilot *AND* telemetry experiment all over again.
// is this reinventing the darn wheel?

