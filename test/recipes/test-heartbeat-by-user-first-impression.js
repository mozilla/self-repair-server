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

/*global describe, it, require, console */


"use strict";

var expect = require("chai").expect;
var chai = require("chai");

chai.config.includeStack = true;
chai.config.showDiff = true;


require("../utils").shimTodo(it);
let uuid = require("node-uuid").v4;


let events = require("../../src/common/events");
let runner = require("../../src/runner");
let UITour = require("../../thirdparty/uitour");

let R = require("../../src/heartbeat-by-user-first-impression/heartbeat-by-user-first-impression");
let C = require("../../src/heartbeat-by-user-first-impression/config");

const percent = 0.01;
let days = 1000 * 86400;

let sendTourEvent = function (aEventName, aData) {
  events.dispatchEvent(document,
      "mozUITourNotification",
      {event: aEventName,
        params: aData});
};

describe("test uitour", function () {
  it("uitour observes, and utils sends", function (done) {
    UITour.observe(function aListener (aEventName, aData) {
      if (aEventName === "mycustom") {
        expect(aData).deep.equal({cool:"yes"})
        done();
      }
    });
    // super tour specific
    sendTourEvent("mycustom", {cool: "yes"});
  });
});

describe("heartbeat-by-user-first-impression", function () {
  it("is valid recipe", ()=>{
    try {
      expect(runner.validateConfig(R)[1]).to.be.true();
    } catch (e) {
      console.log(runner.validateConfig(R)[0]);
      throw e;
    }
  });

  describe("eStore maps to localStorage", function() {
    it("is created during import on default key", function () {
      let E = R.testable.eData;
      expect(E.key).equal(R.config.lskey);
      expect(E).keys("store", "revive", "data", "key", "clear");
      expect(E.data).contain.keys("flows","lastRun");
      expect(E.key in localStorage).true();
    });
  });


  describe("Lstore", function () {
    let u = uuid();
    let L = new R.testable.Lstore(u);

    it.todo('make something less awful for this', function () {
      /* in paritcular,
       - proxy?
       - changing data should cause a store always
       - (seems an awful lot like jetpack simple-store)
       */
    });

    it("has methods", ()=>{
      let expected = ["store", "revive", "data", "key", "clear"];
      expect(L).keys(expected);
      expected.forEach((x)=>{
        if (x === "data" || x === "key") return // not methods
        expect(L).respondTo(x);
      })
    })

    it("stores on store", () => {
      L.data.b = [1,2,3];
      L.store();
      expect(JSON.parse(localStorage[L.key]).b).deep.equal([1,2,3]);
    })

    it("clears data, and clear also stores", () =>{
      L.data.c = 1;
      L.store();
      L.clear();
      expect(JSON.parse(localStorage[L.key]).c).not.exist();
      expect(L.data.c).not.exist();
    })

    it("methods return this", () =>{
      expect(L.store() === L).true();
      expect(L.revive() === L).true();
      expect(L.clear() === L).true();
    })
  })


  describe("eStore stores things", function () {
    // all of these are tested in the racing test.
    it("knows last Run", function (){});
    it("sets last Run on offer", function (){});
    it("starts with last Run 0", function (){});
    it("records last score", function (){
      // otherwise derivable from 'flows'
    });
    it.todo("should cap the number of flows (for localStorage size)", new Function());

  });

  describe("waitedEnough", function(){
    let waitedEnough = R.testable.waitedEnough;
    //waitedEnough(restdays, lastRun, now)
    it("correct answers", ()=> {
      let now = Date.now();
      expect(waitedEnough(10, now - 10*days, now), 'diff == days').true();
      expect(waitedEnough(10, now - 10*days, now + 1), "diff > days").true();
      expect(waitedEnough(10, now - 10*days, now - 1), "diff < days").false();
      expect(waitedEnough(10, 0, now), "0 lastRun").true();

    })
  })

  describe("should-run", function () {
    describe("nightly", function () {
      it("stop run if too recent", function (){
        let state = {updateChannel: "nightly"};
        let restdays = C.nightly.restdays;
        let now = Date.now();
        let ans = R.shouldRun({}, C.nightly,
          {when: now - 1, lastRun: now - (restdays * days) })
        expect(ans).false();
      });
      it("go if been long enough!", function (){
        // use the real configs, as though this is a nightly
        let state = {updateChannel: "nightly"};
        let restdays = C.nightly.restdays;
        let now = Date.now();
        let ans = R.shouldRun(state, undefined,
          { when: now,
            lastRun: now - (restdays * days),
            randomNumber: .99 * C.nightly.sample // also clear the sampler!
          })
        expect(ans).true();
      });
      it("should respect the sampling percentage", function (){
        let state = {updateChannel: "nightly"};
        let p = C['nightly'].sample;
        let restdays = C.nightly.restdays;
        let now = Date.now();
        expect(R.shouldRun(state, null, {
          randomNumber: 99*percent*p,
          when: now,
          lastRun: now - (restdays * days)
        }), "99% of rng is good!").true();
        expect(R.shouldRun(state, null, {
          randomNumber: 101*percent*p,
          when: now,
          lastRun: now - (restdays * days)
        }), "101% of rng is bad").false();
      });
    });
    describe("all other platforms", function () {
      it("config is overridable if needed", function () {
        let state = {updateChannel: "fakeyfake"};
        expect(R.shouldRun(state, {
          sample: 100 * percent,
          restdays: 0
        },
        {lastRun: 0}
        )).to.be.true();
      });

      it("should not run, b/c no config", function(){
        ["release","aurora","beta"].forEach(function(c){
          let state = {updateChannel: c};
          R.shouldRun(state);
          expect(R.shouldRun(state)).to.be.false();
        });
      });
    });
  });

  describe("run", function () {
    it("should set lastRun when it runs", function (done){
      let u = uuid();
      let now = Date.now();
      R.run({},{flow_id: u, when: now, simulate:true}).then(
        () => {
          expect(R.testable.eData.data.lastRun).equal(now)
          done()
        }
      )
    });
    it.todo("should phone home correctly", function () {

    });
    it("creates a stored flow by side effect", function (done) {
      let u = uuid();
      let E = R.testable.eData;
      R.run({},{flow_id: u, simulate:true}).then( // no phoning
        () => {
          expect(E.data.flows[u]).exist();
          done();
        }
      );
    });

    // drive the Heartbeat action, even without ui!
    it("walk through two simultaneous (racing) flows, integration test", function (done) {
      /**
        * 'flow' tests ensure that stages go through in order
        */

      let uuids = [uuid(), uuid()];

      // two at once!  wut!?
      let finished = 0;

      uuids.forEach(function(u) {
        let E = R.testable.eData;

        let getSavedFlow = function (flowid) {
          return JSON.parse(localStorage[E.key]).flows[flowid];
        }

        // `events.observe` to catch rebroadcasted events at the experiment.
        let seen = {};
        let toRemove = events.observe(u, (function flowListener (aEventName, aData) {
          let msg = aEventName;
          // these all take the 'flow.data' as aData
          switch (msg) {
            case "began":
            case "offered":
            case "voted": {
              seen[msg] = true;
              // local store
              expect(aData).deep.equal(getSavedFlow(u));
              // mapped store
              expect(aData).deep.equal(E.data.flows[u]);

              if (msg === "voted") {
                expect(E.data.flows[u].score).equal(3);
                expect(E.data.lastScore).exist(); // now it's set
                expect(seen).deep.equal({
                  began: true,
                  voted: true,
                  offered: true
                })
                finished++;
                if (finished === uuids.length) {
                  done() ; // the whoe test!
                }
              }
              break;
            }
            default:
              break;
          }
        }))

        R.run({},{flow_id: u, simulate:true}); // running.

        // similuate how tour events will come through.
        sendTourEvent("Heartbeat:NotificationOffered", {flowId: u});
        sendTourEvent("Heartbeat:Voted", {flowId: u, score: 3});
      });
    })
  });

  describe("testable functions", function () {
    it("exports exist (and some are functions)", () =>{
      var expected = ["eData", "waitedEnough", "Lstore",  "setupState"];
      // chaijs/chai/issues/359
      expect(R.testable, "keys exist").keys(expected.slice(0));
      expected.slice(1).forEach((k) => {
        expect(R.testable[k], `[${k} function]`).a("function");
      })
    });
  });

  describe("upload issues", function() {
  });
});
