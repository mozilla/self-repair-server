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

require("../utils").shimTodo(it);
let uuid = require("uuid").v4;


let ru = require("../../src/common/recipe-utils");

describe("recipe-utils", function () {
  describe("Lstore", function () {
    let u = uuid();
    let L = new ru.Lstore(u);

    it.todo('proxy s.t. set saves', function () {
      /* in paritcular,
       - proxy?
       - changing data should cause a store always
       - (seems an awful lot like jetpack simple-store)
       */
    });

    it('robust to forgotten "new"', function () {
      let u = uuid();
      let L = ru.Lstore(u);
      let L2 = new ru.Lstore(u);
      expect(L).instanceOf(ru.Lstore);
      expect(L2).instanceOf(ru.Lstore);
    });

    it("has methods", ()=>{
      let expected = ["store", "revive", "data", "key", "clear"];
      expect(L).keys(expected);
      expected.forEach((x)=>{
        if (x === "data" || x === "key") return // not methods
        expect(L).respondTo(x);
      })
    })

    it("creates empty object if revived on an new key, then storing", function () {
      let u = uuid();
      new ru.Lstore(u);
      expect(localStorage[u]).equal("{}");
    });

    it("is preventExtensions to prevent setting keys on it instead of data", function () {
      // warning, only in strict mode!
      expect(()=>{L.someProp = 1}).throw();
    });

    it("stores on store", () => {
      L.data.b = [1,2,3];
      L.store();
      expect(JSON.parse(localStorage[L.key]).b).deep.equal([1,2,3]);
    })

    it("clears data, and clear also stores", () =>{
      L.data.c = 1;
      L.store();
      L.clear();
      expect(JSON.parse(localStorage[L.key]).c).not.exist;
      expect(L.data.c).not.exist;
    })

    it("methods return this", () =>{
      expect(L.store() === L).true;
      expect(L.revive() === L).true;
      expect(L.clear() === L).true;
    })

    it("accessing and setting keys on the Lstore itself will throw.", () => {
      let u = uuid();
      let re = new RegExp(u);
      expect(()=>L[u]).to.throw(Error, re);
      expect(()=>{L[u] = 1}).to.throw(Error, re);
    })
  })
})
