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
let personinfo = require("../../src/common/personinfo");

var MockLocalStorage = require('mock-localstorage');

require("../utils").shimTodo(it);

function ShimTour () {
  this._data = {
    appinfo: {
      defaultUpdateChannel: "shim",
      version: "3.5"
    },
    sync: {},
    selectedSearchEngine: {}
  },
  // var avail = ["sync", "appinfo", "availableTargets", "selectedSearchEngine"];
  this.getConfiguration = function(which, cb) {
    cb(this._data[which]);
  }
}

describe("personalinfo", function () {
  describe('module', () => {
    let wanted = [ "config", "personinfo", "navigatorInfo", "tryLocalStorage", "isLocalStoragePersistent" ];
    it('export keys, as methods', ()=>{
      expect(personinfo).keys(wanted);
      wanted.forEach((k)=>{
        if (k == "config") {
          expect(personinfo[k], "${k} is object").to.be.an("object");
        } else {
          expect(personinfo, "${k} is method").respondTo(k);
        }
      })
    })
  });

  describe ("fakes and shims", () => {
    it('will flag as timeout and incomplete, but resolve', function (done) {
      let aConfig = {
        timeout: 100
      };
      personinfo.personinfo(null, aConfig).then(
        (out) => {
          expect(out.flags.timeout, "timeout").equal(aConfig.timeout);
          expect(out.flags.incomplete, "incomplete").true();
          done();
        }
      );
    });
    it('will flag with overrides, but resolve', function (done) {
      let channel = "baloney";
      let aConfig = {
        timeout: 100,
        overrides: {"updateChannel": channel,
          country: 'us'}
      };
      personinfo.personinfo(null, aConfig).then(
        (out) => {
          expect(out.updateChannel).equal(channel);
          expect(out.country).equal(aConfig.overrides.country);

          expect(out.flags.timeout).equal(aConfig.timeout);
          expect(out.flags.incomplete).true();
          done();
        }
      )
    });

    it("exercise onGet with shim tour", function (done) {
      let was = personinfo.config.timeout;
      personinfo.config.timeout = 1000;
      let tour = new ShimTour();
      let channel = tour._data.appinfo.defaultUpdateChannel;
      personinfo.personinfo(tour).then(
        (out) => {
          let wanted = Object.keys({updateChannel:  "",
            fxVersion: "",
            locale: "unknown",
            flags: {}
          });
          expect(out).include.keys(wanted);
          expect(out.updateChannel).equal(channel);
          personinfo.config.timeout = was; // reset
          done();
        }
      )
    })

    it("call back with data (shape)", function (done) {
      personinfo.personinfo(null, {timeout:100}).then(
        (out) => {
          let wanted = Object.keys({updateChannel:  "",
            fxVersion: "",
            locale: "unknown",
            flags: {}
          });
          expect(out).include.keys(wanted);
          done();
        }
      )
    })
  });

  it.todo("figure out how to test this on a tour-priv'd page", ()=>{});

  describe("persistent localStorage", function () {
    const PERSISTENT_LOCALSTORAGE_KEY = "localStorageUsed";

    it("tryLocalStorage and isLocalStoragePersistent works", function () {
      let store = new MockLocalStorage();
      let get = () => {
        let v = store.getItem(PERSISTENT_LOCALSTORAGE_KEY);
        if (v !== undefined) {
          return JSON.parse(v);
        } else {
          return v;
        }
      }
      let set = (val) => store.setItem(PERSISTENT_LOCALSTORAGE_KEY, val);

      expect(get(store), "should be undefined at first").to.equal(undefined);
      expect(personinfo.isLocalStoragePersistent(store), "isPersistent false at 0").to.equal(false);

      personinfo.tryLocalStorage(store);
      expect(get(store), "then 1").to.equal(1);
      expect(personinfo.isLocalStoragePersistent(store), "isPersistent false at 1").to.equal(false);

      personinfo.tryLocalStorage(store);
      expect(get(store), "then 2").to.equal(2);
      expect(personinfo.isLocalStoragePersistent(store), "isPersistent true at 2").to.equal(true);

      personinfo.tryLocalStorage(store);
      expect(get(store), "then 2 forever!").to.equal(2);
      expect(personinfo.isLocalStoragePersistent(store), "isPersistent true at 2").to.equal(true);

      // set up for garbage;
      store.clear();
      set("{some jank");
      expect(personinfo.isLocalStoragePersistent(store), "isPersistent false with garbage").to.equal(false);

      personinfo.tryLocalStorage(store);
      expect(get(store), "if old value was garbage (wrong type), go to 1").to.equal(1);

    });
  })

});
