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
let actions = require("../../src/common/actions");

describe("actions list", function () {
  it("log, showHeartbeat, personinfo", function () {
    expect(actions).to.have.keys(['log','showHeartbeat','personinfo']);
  });
});
