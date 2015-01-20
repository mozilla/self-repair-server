/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/. */

/*jshint forin:true, noarg:false, noempty:true, eqeqeq:true, bitwise:true,
  strict:true, undef:true, curly:false, browser:true,
  unused:true,
  indent:2, maxerr:50, devel:true, node:true, boss:true, white:true,
  globalstrict:true, nomen:false, newcap:true, esnext: true, moz: true  */

/*global require, exports, log */

"use strict";

let actions = require("./common/actions");

// module level vars, state between invocations, etc.


// validation? section.  Sync?  Blocking?
let shouldRun = exports.shouldRun = function (state) {
  return true;
};

// run / list of actions.  Async?  (I like promises personally)
let recipe = function (state, callback) {
  actions.log("everybody recipe is called");
  callback(true);
};

exports.name = "always run example";
exports.shouldRun = shouldRun;
exports.recipe = recipe;


//09:13 < willkg> date created? date last updated? url to source code/history?
//09:13 < willkg> license?
//09:14 < willkg> maybe the sha or the current version? (assuming recipes can be changed over time.)
