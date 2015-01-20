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

let uitour = require("../thirdparty/uitour");

describe("thirdparty-uitour", function () {
  it('should have `heartbeat` and `observe`', function(){
    expect(uitour).include.keys("observe", "showHeartbeat");
  })
  it("should fire a showHeartbeat message", function () {

    // when it fires... get something
  })
})

/*
describe("repairs", function () {
  expect(repairs).instanceof(Array);
});
*/
