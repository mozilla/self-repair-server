/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/. */

/*jshint forin:true, noarg:false, noempty:true, eqeqeq:true, bitwise:true,
  strict:true, undef:true, curly:false, browser:true,
  unused:true,
  indent:2, maxerr:50, devel:true, node:true, boss:true, white:true,
  globalstrict:true, nomen:false, newcap:true, esnext: true, moz: true  */

/*global require */

// 'use strict';
//
// let { uu } = require("utils");
// let Q = require("arms").questions[0];
// let { validate } = require("upload-validate");
// let { annotate } = require("phonehome");
// let flow = require("flow");
// let experiment = require("experiment");
//
// exports['test annotated flow packets validate'] = function(assert, done) {
//   done = utils.doneclean(done);
//   let flow_id = uu();
//
//   experiment.firstStartup().then(
//   () => {flow.create(flow_id, Q);}).then(
//   annotate).then(
//   (d) => {
//     console.log(JSON.stringify(d,null,2))
//     try {
//       d.is_test = true;  // needed.
//       assert.ok(validate(d)); // may turn into a reject.
//       assert.equal(d.flow_id, flow_id, "flow id matches");
//       done();
//     } catch (exc) {
//       assert.fail(exc);
//       done();
//     }
//   }).then(
//     done,
//     done
//   );
//   //phonehome.phonehome().then( // at
//   //).then(done, done);
// };
//
//
// /** model test.  copy as necessary!
//
// // REMEMEBER, if done() is your last step in a test
// // it's probably not really async()
//
// exports['test asyn'] = function(assert, done) {
//   done = utils.doneclean(done);
//   assert.pass();
//   done();
// };
//
// exports['test sync'] = function(assert) {
//   assert.pass();
// };
//
//
// */
//
// require('sdk/test').run(exports);
