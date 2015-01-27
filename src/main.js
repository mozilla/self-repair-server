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

console.log(
  "Welcome to heart heart heart beat."
);

let actions = require("./common/actions");
let runner = require("./runner");
let personinfo = require("./common/personinfo");
let phonehome = require("./common/heartbeat-phonehome");  // configs only

let merge = require("./common/object").merge;

//end url with ?<somejson>
function paramsToObj(search) {
  search = search.startsWith("?") ? search.substring(1) : search;
  search = search.endsWith("/") ? search.substring(0,search.length-1): search;
  return JSON.parse(decodeURIComponent(search));
}


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
  personinfo.personinfo(
    null, // tour
    function (gottenState) {
      actions.log("about to runAll");
      console.log(gottenState);
      state = gottenState;  // leak it
      runner.runAll(repairsList, state,
        function () { actions.log("runAll callback"); }
    );}
  );
};



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
mainloop(require("./repairs"));


// loop over the list?
// do them all?
// sync or async?
// ye gods it is Test Pilot *AND* telemetry experiment all over again.
// is this reinventing the darn wheel?

