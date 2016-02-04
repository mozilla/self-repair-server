
//TODO

/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/. */

/*jshint forin:true, noarg:false, noempty:true, eqeqeq:true, bitwise:true,
  strict:true, undef:true, curly:false, browser:true,
  unused:true,
  indent:2, maxerr:50, devel:true, node:true, boss:true, white:true,
  globalstrict:true, nomen:false, newcap:true, esnext: true, moz: true,
  asi: true
  */

/*global describe, it, require, console, beforeEach, afterEach */


"use strict";

var expect = require("chai").expect;
var chai = require("chai");

chai.config.includeStack = true;
chai.config.showDiff = true;

require("../../utils").shimTodo(it);
let uuid = require("node-uuid").v4;

let { releaseDateMultiplier } = require("../../../src/common/sampling/releasedate");

let defaultMultiplier = 3.14;
let version = 1001;
let channel = "realChannel";
let multipliers = [2, 3, 4, 5, 6, 7, 8];
let fakeString = "fakeString";
let fakeNumber = -1;
// need to use .replace because we need just-in-time substitution
let dayReplace = "REPLACEME";
let currentDateTemplate = `Tue Jan ${dayReplace} 2015 9:00:0 GMT-0700 (PDT)`;

let extras = {
  "releaseDateSampling": {
    [version]: {
      [channel]: {
        "multipliers": multipliers, // These are going to be === the currentDate for ease of testing.
        "releaseDateString": currentDateTemplate.replace(dayReplace, multipliers[0])
      }
    }
  },
  "fxVersion":         `${version}.boo.foo`,
  "updateChannel":     channel,
  "defaultMultiplier": defaultMultiplier,
  "currentDate":       undefined
};

describe("releasedate", function () {
  describe("releaseDateMultiplier", function () {

    it("works when the release is in the timeframe", function () {
      for (let i of multipliers){
        extras.currentDate = currentDateTemplate.replace(dayReplace, i);
        var m = releaseDateMultiplier({}, extras);
        expect(m).to.equal(i);
      };
    });

    it("works when the release is before the timeframe", function () {
      extras.currentDate = currentDateTemplate.replace(dayReplace, 1);
      var m = releaseDateMultiplier({}, extras);
      expect(m).to.equal(defaultMultiplier);
    });

    it("works when the release is after the timeframe", function () {
      extras.currentDate = currentDateTemplate.replace(dayReplace, 9);
      var m = releaseDateMultiplier({}, extras);
      expect(m).to.equal(defaultMultiplier);
    });

    it("returns the defaultMultiplier when values are not supported", function () {
      var tmpFxVersion = extras.fxVersion;
      extras.fxVersion = fakeNumber;
      var m = releaseDateMultiplier({}, extras);
      expect(m).to.equal(defaultMultiplier);
      extras.fxVersion = tmpFxVersion;

      var tmpUpdateChannel = extras.updateChannel;
      extras.updateChannel = fakeString;
      var m = releaseDateMultiplier({}, extras);
      expect(m).to.equal(defaultMultiplier);
      extras.updateChannel = tmpUpdateChannel;
    });

    it("returns the defaultMultiplier when values are undefined", function () {
      var tmpFxVersion = extras.fxVersion;
      extras.fxVersion = undefined;
      var m = releaseDateMultiplier({}, extras);
      expect(m).to.equal(defaultMultiplier);
      extras.fxVersion = tmpFxVersion;

      var tmpUpdateChannel = extras.updateChannel;
      extras.updateChannel = undefined;
      var m = releaseDateMultiplier({}, extras);
      expect(m).to.equal(defaultMultiplier);
      extras.updateChannel = tmpUpdateChannel;
    });

  })
});
