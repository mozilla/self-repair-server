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

/*global describe, it, require */

"use strict";

let { expect } = require("chai");
let rulesMod = require("../../src/common/rules");

require("../utils").shimTodo(it);

describe('rules', () => {

  describe('module', () => {
    let wanted = ['firstMatch', 'match', "matchRulePart"];
    it('export keys, as methods', ()=>{
      expect(rulesMod).keys(wanted);
      wanted.forEach((k)=>{
        expect(rulesMod).respondTo(k)
      })
    })
  });

  describe('firstMatch', function () {
    let firstMatch = rulesMod.firstMatch;

    it("correct first match", function () {
      let somerules = [
        {
          locale: 'de'
        },
        {
          locale: /^en/,
          channel: /^release/
        },
        {
          locale: /^en/
        },
        {
          locale: 'es-mx'
        },
        {  // no rules
        },
      ];

      let somepeople = [
        [0, {locale: 'de'}],
        [3, {locale: 'es-mx'}],
        [4, {locale: 'es-es'}],
        [1, {locale: 'en-us', channel: 'release-cck-firefox15'}],
        [2, {locale: 'en-us', channel: 'aurora'}]
      ]
      for (let k in somepeople) {
        let d = somepeople[k];
        expect(firstMatch(d[1], somerules), k).to.equal(d[0]);
      }
    });
  });

  describe('match', function () {
    let match = rulesMod.match;
    it("matching rules match", function () {
      let somerules = [
        [{a:1}, {a:1}, "same keys, same vals"],
        [{b:1}, {b:1}, "same keys, same vals"],
        [{a:1, b:2}, {b:2}, "object bigger"],
        [{b:1}, {}, "empty match rule"],
        [{}, {}, "empty object, empty rules"],
        [{a:1, b:'wut', c: 'yep'}, {a:1, b:'wut'}, "multiple parts"],
        [undefined, {}, "undef object, empty rules"]  // no rules!
      ]
      for (let k in somerules) {
        let d = somerules[k];
        expect(match(d[0], d[1]), d[2]).to.be.true();
      }
    });
    it("not matching rules dont", function () {
      let somerules = [
        [{a:1}, {a:2}, "same keys, diff vals"],
        [{b:1}, {c:1}, "different keys"],
        [{}, {c:1}, 'empty object, has rules'],
      ]
      for (let k in somerules) {
        let d = somerules[k];
        expect(match(d[0], d[1]), d[2]).to.be.false();
      }
    });
  });

  describe('matchRulePart', function () {
    let matchRulePart = rulesMod.matchRulePart;
    it("treats regex as a regex", function () {
      expect(matchRulePart('a',/^a/)).to.be.true();
      expect(matchRulePart('ab','^a')).to.be.false();
    });
    it("treats other things a js '=='' match, warts and all", function () {
      expect(matchRulePart(1, 1)).to.be.true();
      expect(matchRulePart('bcd', 'bcd')).to.be.true();
      expect(matchRulePart(1, '1')).to.be.true(); // ugh, js!
      expect(matchRulePart('bcd', 3)).to.be.false();
    })
  });

})
