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
let runSafe = false; // for now, just sets phonehome.testing = true;
if (typeof window !== "undefined") {
  runtimeConfig = paramsToObj(window.location.search);
  runSafe = !!window.location.search;
}

// will only catch things from other windows
//if (window) {
//  window.addEventListener("storage", function (e) {
//    log("storage", key, oldValue, newValue, uri);
//  }, false);
//}


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


phonehome.config.testing = runSafe; // first guess, true if any params

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
      merge(phonehome.config, branch);  // but can override in specific params
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
  main: mainloop,
  phonehome: phonehome,  // mostly to allow devTools override
};

console.log('== heartbeat loaded ==');
console.log('Configuration');
console.log("- phonehome testing flag:", phonehome.config.testing);
console.log("- force shouldRun to be true:", runner.config.alwaysRun);
console.log('Recipes:', recipes.length);
if (recipes.length) {
  recipes.forEach((r)=>console.log('-', r.name));
}
console.log('Command to start (if not started): `heartbeat.main(heartbeat.recipes)`');

