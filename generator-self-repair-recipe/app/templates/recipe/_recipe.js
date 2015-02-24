/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/. */

/*jshint forin:true, noarg:false, noempty:true, eqeqeq:true, bitwise:true,
  strict:true, undef:true, curly:false, browser:true,
  unused:true,
  indent:2, maxerr:50, devel:true, node:true, boss:true, white:true,
  globalstrict:true, nomen:false, newcap:true, esnext: true, moz: true  */

/*global require, exports, log */

'use strict';

let actions = require('../../common/actions');
let events = require('../../common/events');

/**  actions:
  *  - reset bookmarks
  *  - reset firefox
  *  - remove addon
  *  - open sumo
  *  - log
  *  - record
  *  - show heartbeat
  */


/** Experiment Constants.  EDIT THESE. **/
const NAME = '<%= shortname %>';
const FULLNAME = '<%= fullname %>';
const DESCRIPTION  = `
  this is the long long description
  long description for the recipe
  Note that you can use es6-templates just fine
`;
const OWNER = '<%= owner %>';
const VERSION = 1;

// module level vars, state between invocations, etc.
const pct = .01;

let config = {
  restdays: 0,
  sample: 100*pct,
  channels: ['*']
  locales: ['*'],

  // extras, experiment specific
  timesCalled: 0,

};


// bless the localstorage in some way here.
// TODO, utilify this.
var stored = localStorage[NAME];



/**  shouldRun.  'true' goes forward to run(). [required].
  *
  * Arguments:
  * - state
  * - extras: place to pass in / use extra vars for testing.
  *
  * Returns.
  * - boolean.  return false to prevent run
  */
let shouldRun = exports.shouldRun = function (state, aConfig, overrides) {
  // process your state to decide if user is eligible.
  aConfig = aConfig || config;
  overrides = overrides || {};

  // 1.  Too Soon.
  var tooSoon = false;
  if (tooSoon) {
    events.message(name, 'shouldRun:tooSoon', {});
    return false;
  }

  // 2.  Sample Pcts
  let rngGot = overrides.randomNumber;
  let rngWanted = overrides.sample;

  if (rngGot == undefined) rngGot = Math.random();
  if (rngWanted == undefined) rngWanted = aConfig.sample || 100 * pct;

  if (rngGot > rngWanted) {
    events.message(name, 'shouldRun:wrongRandomNumber', {rngGotGot: rngGotGot, rngGotWanted:rngGotWanted});
    return false;
  }

  // 3.  Locales...

  // 4.  Channels?

  // 5.  Addons?

  // 6.  Other things in the state.

  // ...


  // N.  finally return true, b/c nothing disqualified.
  return true;
};



/**  run the recipe steps [required].
  *
  * Arguments:
  * - state
  * - callback
  *
  * Returns.
  * - promise.
  */
let run = function (state, overrides) {
  return new Promise(function (resolve, reject)) {
    events.message(NAME, 'run:starting', {});

    Promise.resolve(true).then (   // starts a promise chain.
    () => actions.log('example recipe is called')).then( // sync action
    () => setTimeout( // complicated async.
      () => {
        config.timesCalled++;
        events.message(NAME, 'run:finishing', {});
        resolve('ok');
      }, 1000  // async.  in 1 sec.
    )
  }
};



// EXPORTS.  These shouldn't require much editing.
// (add to these as necessary)

/**  metadata:
  *  - name (of recipe)
  *  - description
  *  - owner
  *  - version (integer, ascending)
  */
exports.name = NAME;
exports.fullname = FULLNAME;
exports.description = DESCRIPTION;
exports.owner = OWNER;
exports.version = VERSION;

// also required
exports.shouldRun = shouldRun;
exports.run = run;

// useful for testing / external configuration
exports.config = config;

// additional functions, data, etc. to export for testing
// new key so we don't pollute the nai
exports.testableItems = {

}

// REMOVE THESE AFTER DONE DEBUGGING
events.observe(NAME, () => actions.log);
window.moz = {
  recipe: exports,
  actions: actions,
  events: events
}
