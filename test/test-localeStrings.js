/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/. */

/*jshint forin:true, noarg:false, noempty:true, eqeqeq:true, bitwise:true,
  strict:true, undef:true, curly:false, browser:true,
  unused:true,
  indent:2, maxerr:50, devel:true, node:true, boss:true, white:true,
  globalstrict:true, nomen:false, newcap:true, esnext: true, moz: true  */

/*global describe, it, require */

"use strict";

let { expect } = require("chai");

let locales = require("../src/localeStrings");

let supportedLocales = [
  'cs',
  'de',
  'en-us',
  'en-gb',
  'es',
  'es-es',
  'es-mx',
  'fr',
  'it',
  'zh-cn',
  'unk'
];

// this should be the fullest list.
let expectedStrings = Object.keys(locales.supported['en-us'].heartbeat);

describe("locales", function () {
  describe("module", function () {
    it("has right exports", function () {
      let expected = ['supported', "getTranslation"];
      expect(locales).keys(expected);
    });
  });

  describe("supported locales", function () {
    it(`we support these locales: ${supportedLocales}`, function () {
      expect(locales.supported).keys(supportedLocales);
    });

    it("all locale names are lower case", function () {
      expect(supportedLocales.every((k) => k.toLowerCase() == k)).to.be.true;
    });

    it("all locales support same strings as `en-us`", function () {
      // translations are 2 levels deep at most... us/heartbeat, etc.
      let us = locales.supported['en-us'];
      for (let loc of Object.keys(locales.supported)){
        for (let t of Object.keys(locales.supported[loc])) {
          let trans = locales.supported[loc][t];
          let expected = Object.keys(us[t]);
          expect(trans, `${t} is missing some strings.`).to.have.keys(expected);
        }
      }
    });
  });

  describe("getTranslation", function() {
    it("should handle non-existent as UNK", function () {
      var unk = locales.supported.unk;
      expect(locales.getTranslation("blorp")).to.deep.equal(unk);
    });
    it("should handle existing locales correctly", function () {
      for (let t of Object.keys(locales.supported)) {
        let trans = locales.supported[t];
        let ans = locales.getTranslation(t);
        expect(ans, `${t}`).to.deep.equal(trans);
      }
    });
    it("case insensitive", function () {
      for (let t of Object.keys(locales.supported)) {
        let trans = locales.supported[t];
        let ans = locales.getTranslation(t.toUpperCase());
        expect(ans, `${t}`).to.deep.equal(trans);
      }
    });
  });
});
