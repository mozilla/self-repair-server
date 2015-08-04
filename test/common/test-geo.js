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

/*global describe, it, require, before, after */

/*
  note: these tests are hard to write / fragile,
  because they all rely on localStorage being written to in a specific order.
*/

"use strict";

let { expect } = require("chai");
let geo = require("../../src/common/geo");

let localStorageKey = "geoCountry";

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

describe('geo', () => {
  before (clearOurKeys);
  after (clearOurKeys);

  describe('module', () => {
    let wanted = ['getUserCountry', 'reset'];
    it('export keys, as methods', ()=>{
      expect(geo).keys(wanted);
      wanted.forEach((k)=>{
        expect(geo).respondTo(k)
      })
    })
  });

  describe('getUserCountry', () => {

    // setup
    before(()=>clearOurKeys);

    it('gets a country, and sets localStorage', function (done) {
      geo.getUserCountry().then(function(cc) {
        expect(cc.length, "wrong length").to.equal(2);
        expect(localStorage.getItem(localStorageKey).toLowerCase()).to.equal(cc);
        done();
      }, ()=>done(new Error('wut?')))
    })

    it('reflects localStorage', function (done) {
      var ans = 'reflects localStorage'.toLowerCase();
      cacheAnswer(ans);
      geo.getUserCountry().then(function(cc) {
        expect(cc).to.equal(ans);
        done();
      })
    })
    it('respects expiration', function (done) {
      clearOurKeys();
      var ans = 'respects expiration';
      cacheAnswer(ans, new Date(1)); // a long time ago
      geo.getUserCountry().then(function(cc) {
        // more than 30 days old, should refresh
        expect(cc).to.not.equal(ans);
        done();
      })
    })
  })

  describe('reset', () => {
    it('resets the country code', function (done) {
      clearOurKeys();
      var wrong = 'reset';
      cacheAnswer(wrong);

      geo.getUserCountry().then(function (cc) {
        expect(cc).to.equal(wrong);
      }).then(
      geo.reset).then(
      geo.getUserCountry).then(function (cc) {
      expect(cc).to.have.length(2);
      expect(cc).to.not.equal(wrong);
      done();
      }, (err)=>done(new Error(err)))
    })
  })
});
