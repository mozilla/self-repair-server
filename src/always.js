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

//let actions = require("./common/actions");

let config = {
  timesCalled: 0
};

// module level vars, state between invocations, etc.

//
// localStorage;


/**  shouldRun [required].
  *
  * Arguments:
  * - state
  *
  * Returns.
  * - boolean.
  */
let shouldRun = exports.shouldRun = function (state) {
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
let run = function (state) {
  //actions.log("everybody recipe is called");
  config.timesCalled++;
  return Promise.resolve(true);
};


/**  metadata:
  *  - name (of recipe)
  *  - description
  *  - owner
  *  - version (integer, ascending)
  */
exports.name = "always run example";
exports.description = `
  this is the long long description
  long description for always run.
  Note that you can use es6-templates just fine
`;
exports.owner = "Gregg Lind <glind@mozilla.com>";
exports.version = 1;

// also required
exports.shouldRun = shouldRun;
exports.run = run;


// useful for testing
exports.config = config;
