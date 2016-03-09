/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/. */

/*jshint forin:true, noarg:false, noempty:true, eqeqeq:true, bitwise:true,
  strict:true, undef:true, curly:false, browser:true,
  unused:true,
  indent:2, maxerr:50, devel:true, node:true, boss:true, white:true,
  globalstrict:true, nomen:false, newcap:true, esnext: true, moz: true,
  asi: true  */

/*global describe, it, require, exports, log */

"use strict";

/* this code mostly exists
   - for coverage sake
   - catch when new actions are added
*/
let { expect } = require("chai");

describe("built file exports", function () {
  let heartbeat = window.heartbeat;
  let expected = {
    'actions': 'object',
    'runner': 'object',
    'personinfo': 'object',
    'recipes': 'array',
    'events': 'object',
    'main': 'function',
    'phonehome': 'object',
    'UITour': 'object'
  };
  it("exports names are right", function () {
    expect(heartbeat).to.exist;
    expect(heartbeat).to.have.keys(Object.keys(expected));
  });
  it("types are right", function () {
    for (let k in expected) {
      let mytype = expected[k]
      expect(heartbeat[k]).to.be.a(mytype);
    }
  });
  describe("recipe list", function () {
    it("has 2 recipe.", () => {
      expect(heartbeat.recipes.length).to.equal(2);
    });
    it("has heartbeat, right version", function () {
      let hb = heartbeat.recipes[0];
      expect(heartbeat.runner.validateConfig(hb)[1]).true;
      expect(hb.name).equal("heartbeat by user v1");
      expect(hb.version).equal(52);
    });
    it("has messaging, right version", function () {
      let r = heartbeat.recipes[1];
      expect(heartbeat.runner.validateConfig(r)[1]).true;
      expect(r.name).equal("Messaging with external links");
      expect(r.version).equal(10);
    });
  })

  describe("main", function () {
    let heartbeat = window.heartbeat;
    it("will reject if localStorage is not persistent", function (done) {
      localStorage.clear(); // bam.
      expect(heartbeat.personinfo.isLocalStoragePersistent()).to.be.false;
      heartbeat.main([]).then(
        (e) => {done(new Error("should reject as invalid"))},
        (e) => {done()}
      );
    })
    it("will resolve if localStorage is ok", function (done) {
      localStorage.clear(); // bam.
      heartbeat.personinfo.tryLocalStorage();
      heartbeat.personinfo.tryLocalStorage();
      expect(heartbeat.personinfo.isLocalStoragePersistent()).to.be.true;
      heartbeat.main([]).then(
        (e) => {done()},
        (e) => {done(new Error("should have resolved true"))}
      );
    })
  })

  describe('time bombs', function () {
    var DateAfter = function (strWhen) {
      // usage:  DateAfter("Sep 06 2015");
      return Date.now () >= new Date(Date.parse(strWhen))
    };
    var bomb = function (strWhen) {
      return function () { expect(DateAfter(strWhen), "Time bomb:" + strWhen).to.be.false };
    };

    it('if fail, kill 44/45 #243', bomb('Mar 21 2016'));

    // one fail per line.
    //it('if fail, kill dev-ed survey v2  back (see #227, #230)', bomb('Feb 12 2016'));
  })
});
