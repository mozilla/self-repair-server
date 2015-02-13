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

require("../utils").shimTodo(it);

function ShimTour () {
  this._data = {
    appinfo: {
      defaultUpdateChannel: "shim",
      version: "3.5"
    }
  },
  // var avail = ["sync", "appinfo", "availableTargets", "selectedSearchEngine"];
  this.getConfiguration = function(which, cb) {
    cb(this._data[which]);
  }
}

describe("personalinfo", function () {
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
        overrides: {"updateChannel": channel}
      };
      personinfo.personinfo(null, aConfig).then(
        (out) => {
          expect(out.updateChannel).equal(channel);
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

  it("personalinfo exists", function () {
    expect(personinfo.personinfo).to.be.a("function");
  })


  it.todo("figure out how to test this on a tour-priv'd page", ()=>{});
});
