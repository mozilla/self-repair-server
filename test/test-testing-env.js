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

describe("testing environment", function () {
  it('has promises and localStorage', function() {
    expect(window).to.exist();
    expect(localStorage).to.exist();
    expect(Promise).itself.respondTo("all");
    expect(Promise).itself.respondTo("race");  // etc.
  });
});

