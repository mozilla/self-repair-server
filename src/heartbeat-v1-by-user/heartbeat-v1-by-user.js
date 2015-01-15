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
let common = require("../common");
let config = require("./config");
let actions  = common.actions;

/* need to tour observe
phone home in the callback
etc.
*/

let ran30 = function() {
  return false;
};  // attempted in last X days?

let recordAttempt = function () {
  // record this somewhere?
  // ye gods, this is such action as a distance :( //
};


// showHeartbeat: function(aWindow, aType, aMessage, aFlowId) {

// valid? section
// validation? section.  Sync?  Blocking?  who?
let shouldRun = exports.shouldRun = function (state) {
  if (ran30()) return false;
  let myRng = Math.random() * config.expectedUsers;
  if (myRng <= config.wanted) {
    recordAttempt();  // async?
    return true;
  }
};

// run / do
let recipe = function (state, callback) {
  actions.showHeartbeat(null, "stars", "Please Rate Firefox", null);
  callback(true);
};



exports.name = "heartbeat by user v1";
exports.shouldRun = shouldRun;
exports.recipe = recipe;
