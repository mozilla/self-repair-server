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

/*
  note: these tests are hard to write / fragile,
  because they all rely on localStorage being written to in a specific order.
*/

"use strict";

let { expect } = require("chai");
let deployGeo = require("../../src/common/deploy-geo");
let geo = require("../../src/common/geo");


require("../utils").shimTodo(it);

var cacheAnswer = function (answer, when) {
  when = new Date(when || new Date());
  localStorage.setItem(localStorageKey, answer.toLowerCase());
  localStorage.setItem('geoLastUpdated', when);
}

var clearOurKeys = function () {
  localStorage.removeItem(localStorageKey);
  localStorage.removeItem('geoLastUpdated');
};

describe('deployGeo', () => {
  describe('module', () => {
    let wanted = ['getUserCountry', 'reset', 'useReal'];
    it('export keys, as methods', ()=>{
      expect(deployGeo).keys(wanted);
      wanted.forEach((k)=>{
        expect(deployGeo).respondTo(k)
      })
    })
  });

  describe('useReal', () => {
    it('logic is correct', function () {
      var real = true;
      let cases = [
        ["Oct 04 2015 12:03:09 GMT-0500 (CDT)", 0, "not august", real ],
        ["Aug 04 2016 12:03:09 GMT-0500 (CDT)", 0, "not 2015", real],
        ["Aug 04 2015 12:03:09 GMT-0500 (CDT)", 0, "low rng", real ],
        ["Aug 04 2015 12:03:09 GMT-0500 (CDT)", 1, "right rng", !real ],
      ]

      cases.forEach(function (t) {
        let D = new Date(Date.parse(t[0])),
            rng = t[1],
            msg = t[2],
            wanted = t[3];

        expect(deployGeo.useReal(D,rng), msg).to.equal(wanted)
      })
    })
  });

  describe('maybeGetUserCountry', () => {
    it('false does fake', function (done) {
        deployGeo.getUserCountry(false).then((ans) => {
        expect(ans).to.equal("--");
        done();
      });
    })
    it('true does real', function (done) {
        deployGeo.getUserCountry(true).then((ans) => {
        expect(ans).to.not.equal("--");
        done();
      });
    })
  });
})
