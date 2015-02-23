/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/. */

/*jshint forin:true, noarg:false, noempty:true, eqeqeq:true, bitwise:true,
  strict:true, undef:true, curly:false, browser:true,
  unused:true,
  indent:2, maxerr:50, devel:true, node:true, boss:true, white:true,
  globalstrict:true, nomen:false, newcap:true, esnext: true, moz: true  */

/*global require, console */

"use strict";

// TODO, implement all actions in:
// https://bugzilla.mozilla.org/show_bug.cgi?id=1031506

let log = console.log.bind(console, "repair-logger:");

let actions = {
  showHeartbeat:  require("./heartbeat").showHeartbeat,
  // other actions are listed in
  //
  // others?  phone home?  record telemetry?  see bug!
  //   uninstall addon
  //   change some subset of hidden prefs?
  //
  personinfo: require("./personinfo").personinfo,
  log: log,

};

// TODO, this is telemetry
actions.record = actions.log.bind(actions.log, "RECORDING");

module.exports = actions;
