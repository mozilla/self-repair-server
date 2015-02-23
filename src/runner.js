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


create or revive watched key for recipename.lastrun;
recipename.stages?

run heartbeat
  - check
    needs last run
    if bad, stop
  - showHeartbeat
    bind flow under 'current'
    setup callbacks on that flow
  -


*/


"use strict";

let actions = require("./common/actions");
let type = require("./jetpack/type");

const config = {
  alwaysRun: false
};


let validate = function (thing, rules) {
  // TODO, this is way wack.  Reinvent wheels much?  return order?
  let errors  = [];
  rules.map(function(rule) {
    if (! rule(thing) ) {
      errors.push(new Error("Problem: "+ rule.toString()));
    }
  });
  return ([errors, errors.length === 0]);
};

// TODO, write this, decide of return val (throw? false?  list of errors?)
// TODO, use an existing validation system?  chai maybe?
// TODO, record and describe failures
let validateConfig = function (config) {
  // I think this should return an errors, status object, not a bool.
  let rules = [
    (c) => typeof c.name === 'string',
    (c) => typeof c.description === 'string',
    (c) => typeof c.owner === 'string',
    (c) => typeof c.version === 'number',
    (c) => typeof c.run === 'function',
    (c) => typeof c.shouldRun === 'function',
  ];

  return validate(config, rules);
};


/** out guard
  *
  */
let validateRunAttempt = function (obj) {
  let rules = [
    (c) => 'status' in c && 'name' in c
  ];
  return validate(obj, rules);
};


// right now NO
// - fancy error handling
// - stoppability
// - retry

/**
  *
  * Promises a run attempt.  TODO, what is a run attempt?
  *
  * provisional:
  * - resolve:  //{status:  data:?}
  * - reject {reason: reason, data: data}
  *
  * Commentary (provisional):  almost everything should resolve, not reject.
  *   reject here should be catching exceptions that would slag the promise
  *   chain.
  *   This is similar to a '200 always' webapp, and we check the status
  *   of the return.
  *   (Convince GRL otherwise!)
  */

let attemptRun = function (recipe, state, myconfig) {
  myconfig = myconfig || config;

  return new Promise(function (resolve, reject) {
    let outcome = {};
    let valid = validateConfig(recipe);
    if (!valid[1]) resolve({status:  "invalid-config", data: valid[0]}); // errors are in valid[0]

    if (myconfig.alwaysRun || recipe.shouldRun(state)) {
      // TODO, should config be recorded?

      // TODO, what do recipes do?  Callback?
      // TODO, do we wrap their errors?
      // TODO, how do we check that a recipe does a promise for all cases,
      //   without calling them?
      // TODO, when should a recipe reject?  I claim only on TRUE BADNESS.
      let good = () => {
        //actions.record()?
        resolve({name:recipe.name, status: "ok"});
      };
      let bad =  () => {
        reject({name:recipe.name, status: "run-rejected"});
      };

      try {
        recipe.run(state).then(
          good,
          bad
        ); // calls back?  TODO, wants to be promise?
      } catch (err) {
        // TODO, this is super bad.
        reject({name:recipe.name, status: "exception"});
      }

      // TODO, what is a positive thing?

      // yeah, not sure what all the effects here should be

    } else {
      resolve({name:recipe.name, status: "not-run"});
      //actions.log("will not run");
    }
  });
};

// should this call back with some sort of progress / success obj?
// like which ran, and their statuses?
let runAll = function (repairs, statePromiseFn, myconfig) {
  // TODO, arg validators.
  // repairs must be list.
  // statePromiseFn must be an obj, will be called each time,
  //   AND must return a promise
  // should state be an obj, or a getter?

  if (!type.isFunction(statePromiseFn)) {
    // promote to promisedFn
    let p = statePromiseFn;
    statePromiseFn = () => Promise.resolve(p);
  }

  let results = []; // this is what will be returned
  myconfig = myconfig || config;
  let P = Promise.resolve(true);

  let record = function (attempt) {
    results.push(attempt);
    // error handling here?
    // telemetry here?
  };

  // todo, is this a promise chain?
  let l = repairs.length;
  for (let ii=0; ii < l; ii++) {
    // note state gets changed by repairs, by definition
    let repair = repairs[ii];
    // todo, should we re-get state?  TODO yes.
    P = P.then(
      // is this where to re-get state?
      () => {
        return statePromiseFn().then(
          (state) => attemptRun(repair, state, myconfig)
        );
      }
    ).then(
      record,
      (obj) => {
        record(obj);  // TODO. badness should get extra reported
        return Promise.resolve(true); // continue chain.
          // TODO, this right here suggests we shouldn't reject at attemptRun
      }
    );
  }

  P = P.then(()=>results);
  return P;  // a promise of the results object after running all jobs
};


exports.config = config;
exports.validateConfig = validateConfig;
exports.validateRunAttempt = validateRunAttempt;

exports.runAll = runAll;
exports.attemptRun = attemptRun;
