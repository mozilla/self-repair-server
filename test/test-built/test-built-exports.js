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
    expect(heartbeat).to.exist();
    expect(heartbeat).to.have.keys(Object.keys(expected));
  });
  it("types are right", function () {
    for (let k in expected) {
      let mytype = expected[k]
      expect(heartbeat[k]).to.be.a(mytype);
    }
  });
  describe("recipe list", function () {
    it("has 1 recipes.", () => {
      expect(heartbeat.recipes.length).to.equal(1);
    });
    it("has heartbeat, right version", function () {
      let hb = heartbeat.recipes[0];
      expect(heartbeat.runner.validateConfig(hb)[1]).true();
      expect(hb.name).equal("heartbeat by user v1");
      expect(hb.version).equal(28);
    });
  })

  describe('time bombs', function () {
    var DateAfter = function (strWhen) {
      // usage:  DateAfter("Sep 06 2015");
      return Date.now () >= new Date(Date.parse(strWhen))
    };
    var bomb = function (strWhen) {
      return function () { expect(DateAfter(strWhen), "Time bomb:" + strWhen).to.be.false() };
    };
    // one fail per line.
    //it.skip('if fail, revert sampling back (see #139)', bomb('Aug 17 2015'));

    //it('if fail, revert sampling back from 42 oversamle', bomb('Nov 9 2015'));

    //it('if fail, turn off germany pbm survey re 174', bomb('Nov 15 2015'));

  })
});
