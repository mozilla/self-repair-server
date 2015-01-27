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

let { expect } = require("chai");

var setup = function () {
  console.log("setup");
  require("testdom")(null, {
    localStorage : 'localStorage',
    Promise:  'es6-promises'
  });
};

setup();

let repairs = require("../src/repairs");
let runner = require("../src/runner");

describe("repairs", function () {
  it("repairs is a list", function () {
    expect(repairs).to.be.an("array");
  });
  it("all repairs are valid repairs", function () {
    expect(repairs.every(runner.validateConfig)).to.be.true;
  })
});
