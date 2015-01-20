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

var setup = function () {
  require("testdom")(null, {
    localStorage : 'localStorage',
    Promise:  'es6-promises'
  });
};

describe("testing environment", function () {
  it('before setup, missing things', function() {
    // it's hard to test the "before", b/c
    // /Users/glind/gits/self-repair-server/node_modules/mocha-traceur/node_modules/traceur-runner/node_modules/traceur-source-maps/node_modules/source-map-support/source-map-support.js:60
    // does some modding that makes isWindow not right during the transpile,
    // thus expecting XMLHttpRequest not right.

    // Tests would be:
    //expect(typeof localStorage).to.equal("undefined");
    //expect(typeof Promise).to.equal("undefined")
  });
  it("after setup, has es6-Promises and localStorage", function () {
    setup();
    expect(localStorage).to.exist;
    expect(Promise).itself.respondTo("all");
    expect(Promise).itself.respondTo("race");  // etc.
  });
})

