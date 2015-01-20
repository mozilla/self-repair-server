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

let runner = require("../src/runner");

let goodConfig = {
  name: 'a',
  description: 'b',
  recipe: function(){},
  shouldRun: function () {}
};

let badConfigs = [
  {
    name: null,
    description: null,
    recipe: function(){},
    shouldRun: function () {}
  },
  {
    name: 'a',
    description: 'b',
    recipe: 'c',
    shouldRun: 'd'
  }
];

describe("runner validates", function () {
  it("a valid config validates", function () {
    expect(runner.validateConfig(goodConfig)[1]).to.be.true;
  });
  it("should test fuzzing configs", function () {
    expect(false).to.be.true;
  });
  it("should know badConfigs are bad", function () {
    badConfigs.map(function(c) {
      expect(runner.validateConfig(c)[1]).to.be.false;
    });
  })
});
