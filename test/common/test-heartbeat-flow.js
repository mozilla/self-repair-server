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
require("../utils").shimTodo(it);

let Flow = require("../../src/common/heartbeat-flow").Flow;

describe("heartbeat-flow", function () {
  it("flow has methods", function () {
    console.log(Object.keys(new Flow()));
    expect(Flow).to.be.a("function");
    expect(new Flow()).to.be.a("object");
  })
//  it.todo("showHeartbeat promises?", function () {})
//  it.todo("showHeartbeat arity checks should <something>", function () {})
//  it.todo("showHeartbeat arity checks should throw if callback arg is not a function", function () {})
//  it.todo("showHeartbeat should show and message", function () {})
//  it.todo("showHeartbeat should return something with a bound flow", function () {})
//  it.todo("showHeartbeat should callback during stages", function () {})
});
