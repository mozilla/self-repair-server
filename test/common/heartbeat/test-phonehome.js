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

require("../../utils").shimTodo(it);
let uuid = require("node-uuid").v4;

let events = require("../../../src/common/events");
let runner = require("../../../src/runner");
let UITour = require("thirdparty/uitour");
let personinfo = require("../../../src/common/personinfo");
let R = require("../../../src/recipes/heartbeat-by-user-first-impression");
let E = R.testable.eData;

let phonehome = require("../../../src/common/heartbeat/phonehome");

describe("heartbeat phonehome", () => {
  let u = "test-phonehome-1";
  let orig = personinfo.config.timeout;
  beforeEach(function () {
    personinfo.config.timeout = 50;
    phonehome.config.testing = true;
  });
  afterEach(function () {
    personinfo.config.timeout = orig;
    delete E.data.flows[u];
  });

  it("flows are valid to phonehome with", function (done) {
    let now = Date.now();
    R.run({},{flow_id: u, when: now, simulate:true}).then(
      () => {
        // the test
        // visible at:  https://input.mozilla.org/en-US/analytics/hbdata/13913
        let flow = E.data.flows[u]; // the created flow
        let doIt = (thing) => {done()};
        phonehome.phonehome(flow).then(
          doIt,
          doIt
        )
      }
    )
  });


  it("phonehome with garbage is garbage", function (done) {
    phonehome.phonehome({}).then(
      () => done(new Error("should reject as invalid")),
      () => done()
    )
  });

  it("phonehome empty is garbage", function (done) {
    phonehome.phonehome().then(
      () => done(new Error("should reject as invalid")),
      () => done()
    )
  });

  it("handles extra data", function (done) {
    let u = "handles-extra-data-test";
    let now = Date.now();
    phonehome.config.extraData = {
      a: 1,
      b: [1, 2, 3]
    };

    let test = (thing) => {
      expect(thing.extra).deepEqual({a:1, b:[1,2,3]})
      delete phonehome.console.extraData
      done();
    };
    R.run({},{flow_id: u, when: now, simulate:true}).then(
      () => {
        // the test
        let flow = E.data.flows[u]; // the created flow
        phonehome.phonehome(flow).then(
          (thing) => test(thing),
          ()=> done(new Error("should resolve"))
        )
      }
    )
    phonehome.phonehome().then(
      () => done(new Error("should reject as invalid")),
      () => done()
    )
  });


  describe("phonehome false", function () {
    let orig = personinfo.config.timeout;
    beforeEach(()=>{
      phonehome.config.phonehome = false;
      personinfo.config.timeout = 50;
    })
    afterEach(()=>{
      phonehome.config.phonehome = true
      personinfo.config.timeout = orig;
    })
    it("shouldn't phonehome", function(done){
      let now = Date.now();
      let test = (thing) => {
        expect(thing).a("array");
        done();
      };
      R.run({},{flow_id: u, when: now, simulate:true}).then(
        () => {
          // the test
          let flow = E.data.flows[u]; // the created flow
          phonehome.phonehome(flow).then(
            (thing) => test(thing),
            ()=> done(new Error("should resolve"))
          )
        }
      )
    })
  })

})
