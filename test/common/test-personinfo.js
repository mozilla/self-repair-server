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


/* this code mostly exists
   - for coverage sake
   - catch when new actions are added
*/
let { expect } = require("chai");
let personinfo = require("../../src/common/personinfo");

require("../utils").shimTodo(it);

describe("personalinfo", function () {
  it("personalinfo exists", function () {
    expect(personinfo.personinfo).to.be.a("function");
  })
  it.todo("personalinfo make shim tour", function () {
    // shim it with a fake tour?  that
  })
  it.todo("personalinfo callsback with data", function () {
    // hard to test this without shims
  })
});
