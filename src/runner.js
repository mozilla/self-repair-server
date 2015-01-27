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
let chai = require("chai");

let config = exports.config = {};

// TODO, write this, decide of return val (throw? false?  list of errors?)
// TODO, use an existing validation system?  chai maybe?
// TODO, record and describe failures
let validateConfig = function (config) {
  // I think this should return an errors, status object, not a bool.
  let errors  = [];
  let rules = [
    function (c) {chai.expect(c.name).to.be.a("string")},
    function (c) {chai.expect(c.description).to.be.a("string")},
    function (c) {chai.expect(c.recipe).to.be.a("function")},
    function (c) {chai.expect(c.shouldRun).to.be.a("function")}
  ];

  rules.map(function(rule) {
    try {
      rule(config)}
    catch (E) {
      errors.push(E);
    }
  });

  return ([errors, errors.length == 0])
  // has keys
  // these are callables?
  //
}; //


// right now NO
// - fancy error handling
// - stoppability
// - retry

let attemptRun = function (recipe, state) {
  let valid = validateConfig(recipe);
  if (!valid[1]) throw new Error("invalid config"); // errors are in valid[0]
  if (recipe.shouldRun(state) || config.alwaysrun) {
    actions.log("will run", recipe, "alwaysrun", config.alwaysrun);
    recipe.recipe(state)

    //.then(
    //  function () {actions.log(recipe.name);},
    //  function () {actions.error(recipe.name);}
    //);  // yeah, not sure what all the effects here should be
  } else {
    actions.log("will not run");
  }
};

// should this call back with some sort of progress / success obj?
// like which ran, and their statuses?
let runAll = function (repairs, state, cb) {
  let l = repairs.length;
  actions.log(l);
  for (let ii=0; ii < l; ii++) {
    // note state gets changed by repairs, by definition
    let repair = repairs[ii];
    actions.log("attempting", repair.name);
      attemptRun(repair, state);
  }
  cb(true);
};


exports.validateConfig = validateConfig;
exports.runAll = runAll;
exports.attemptRun = attemptRun;

