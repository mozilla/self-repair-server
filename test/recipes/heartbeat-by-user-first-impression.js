/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/. */

/*jshint forin:true, noarg:false, noempty:true, eqeqeq:true, bitwise:true,
  strict:true, undef:true, curly:false, browser:true,
  unused:true,
  indent:2, maxerr:50, devel:true, node:true, boss:true, white:true,
  globalstrict:true, nomen:false, newcap:true, esnext: true, moz: true  */

/*global describe, it, require, exports, log */


"use strict";

var expect = require("chai").expect;
require("../utils").shimTodo(it);

var setup = function () {
  console.log("setup");
  require("testdom")(null, {
    localStorage : 'localStorage',
    Promise:  'es6-promises'
  });
};

setup();
// hb need localStorage, so setup first.


//let hb = require("../../src/heartbeat-by-user-first-impression/heartbeat-by-user-first-impression");

describe("heartbeat-by-user-first-impression", function () {
  describe("module should import", function () {
    it.todo("testing style should make it possible for hb to import");
  })
  describe("eligible-nightly", function () {
    it.todo("should not run if too recent", function (){});
    it.todo("should respect the sampling percentage", function (){});
  });
  describe("run-nightly", function () {
    it.todo("should record when it runs", function (){});
    it.todo("should phone home correctly", function () {});
  });
  describe("testable functions", function () {
    it.todo("test all testable functions", Function());
  })
})


