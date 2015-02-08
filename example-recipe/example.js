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

let actions = require("../../common/actions");
let events = require("../../common/events");

/**  actions:
  *  - reset bookmarks
  *  - reset firefox
  *  - remove addon
  *  - open sumo
  *  - log
  *  - record
  *  - show heartbeat
  */


console.log("actions", Object.keys(actions));

/** Experiment Constants **/
const NAME = "example";
const DESCRIPTION  = `
  this is the long long description
  long description for the recipe
  Note that you can use es6-templates just fine
`;
const OWNER = "owner <owner@example.com>";
const VERSION = 1;


let config = {
  timesCalled: 0
};

// module level vars, state between invocations, etc.



/**  shouldRun [required].
  *
  * Arguments:
  * - state
  *
  * Returns.
  * - boolean.
  */
let shouldRun = exports.shouldRun = function (state) {
  // process your state to decide if user is eligible.
  return true;
};


/**  run [required].
  *
  * Arguments:
  * - state
  * - callback
  *
  * Returns.
  * - promise.
  */
let run = function (state, extras) {
  actions.log("example recipe is called");
  config.timesCalled++;
  return Promise.resolve(true);
};


/**  metadata:
  *  - name (of recipe)
  *  - description
  *  - owner
  *  - version (integer, ascending)
  */
exports.name = NAME;
exports.description = DESCRIPTION;
exports.owner = OWNER;
exports.version = VERSION;

// also required
exports.shouldRun = shouldRun;
exports.run = run;


// useful for testing
exports.config = config;

// take this out later
window.moz = {
  recipe: exports,
  actions: actions,
  events: events
}
