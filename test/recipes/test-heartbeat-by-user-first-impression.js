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

/*global describe, it, require, console, beforeEach, afterEach, before */


"use strict";

var expect = require("chai").expect;
var chai = require("chai");

chai.config.includeStack = true;
chai.config.showDiff = true;

require("../utils").shimTodo(it);
let uuid = require("node-uuid").v4;

let events = require("../../src/common/events");
let runner = require("../../src/runner");

let phonehome = require("../../src/common/heartbeat/phonehome");
let personinfo = require("../../src/common/personinfo");

let R = require("../../src/recipes/heartbeat-by-user-first-impression");
let C = require("../../src/recipes/heartbeat-by-user-first-impression/config");


const percent = 0.01;
let days = 1000 * 86400;

let sendTourEvent = function (aEventName, aData) {
  events.dispatchEvent(document,
      "mozUITourNotification",
      {event: aEventName,
        params: aData});
};

describe("heartbeat-by-user-first-impression", function () {
  // these feel very action at a distance to me!
  let orig = personinfo.config.timeout;
  beforeEach(function () {
    personinfo.config.timeout = 50;
    phonehome.config.testing = true;
  });
  afterEach(function () {
    personinfo.config.timeout = orig;
    phonehome.config.testing = false;
  });

  var localStoreMsg = `check that other tests arent fully clearing localStore.

  There is complex interactions between require, run order, etc when webpack and mocha interact`;

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
      it("is created, during import (on default key)", function () {
        let E = R.testable.eData;
        expect(E.key, "wrong ls key").equal(R.config.lskey);
        expect(E, "wrong keys").keys("store", "revive", "data", "key", "clear");
        expect(E.data, "wrong data keys").contain.keys("flows","lastRun");
        expect(E.key in localStorage, "E.key not in localStorage. ${localStoreMsg}").true();
      });
    });


    describe("Lstore", function () {
      let u = uuid();
      let L = new R.testable.Lstore(u);

      it.todo('proxy s.t. set saves', function () {
        /* in paritcular,
         - proxy?
         - changing data should cause a store always
         - (seems an awful lot like jetpack simple-store)
         */
      });

      it('robust to forgotten "new"', function () {
        let u = uuid();
        let L = R.testable.Lstore(u);
        let L2 = new R.testable.Lstore(u);
        expect(L).instanceOf(R.testable.Lstore);
        expect(L2).instanceOf(R.testable.Lstore);
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
        new R.testable.Lstore(u);
        expect(localStorage[u]).equal("{}");
      });

      it("is sealed to prevent setting keys on it instead of data", function () {
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

        // implict Date.now() at function
        expect(waitedEnough(10, Date.now()-11*days), "now() internally broken").true();
        expect(waitedEnough(10, Date.now()-9*days), "now() internally broken").false();

      })
    })

    describe("should-run", function () {
      describe("known channels", function () {
        var allchannels = ['nightly', 'aurora', 'beta', 'release'];

        it('config has right channels: '+ allchannels.join('|'), () => {
          expect(C).keys(allchannels);
        })

        // check that each channel behaves
        it('stop run if too recent', function (done){
          allchannels.forEach(function (channel) {
            let obs = events.observe(R.name, (msg, data) => {
              events.unobserve(obs);
              if (msg === "too-soon") {
                done()
              } // else {
              //  done(new Error([msg, data]));
              //}
            })

            let state = {updateChannel: channel, locale: "en-US"};
            let restdays = C[channel].restdays;
            let now = Date.now();
            let ans = R.shouldRun(state, C[channel],
              {when: now - 1, lastRun: now - (restdays * days)
            })
            expect(ans, channel).false();
          })
        });
        it('go if been long enough!', function (){
          allchannels.forEach(function (channel) {
            // use the real configs, as though this is a nightly
            let state = {updateChannel: channel, locale: "en-US"};
            let restdays = C[channel].restdays;
            let now = Date.now();
            let ans = R.shouldRun(state, undefined,
              { when: now,
                lastRun: now - (restdays * days),
                randomNumber: .99 * C[channel].sample // also clear the sampler!
              })
            expect(ans, channel).true();
          })
        });
        it('should respect the sampling percentage', function (){
          allchannels.forEach(function (channel) {
            let state = {updateChannel: channel, locale: "en-US"};
            let p = C[channel].sample;
            let restdays = C[channel].restdays;
            let now = Date.now();
            expect(R.shouldRun(state, null, {
              randomNumber: 99*percent*p,
              when: now,
              lastRun: now - (restdays * days)
            }), channel + ' 99% of rng is good!').true();
            expect(R.shouldRun(state, null, {
              randomNumber: 101*percent*p,
              when: now,
              lastRun: now - (restdays * days)
            }), channel + ' 101% of rng is bad').false();
          })
        });

        it('runs on in several locales', function () {
          let oklocales = ['en-US', 'en-GB', 'de', 'fr']
          allchannels.forEach(function (channel) {
            oklocales.forEach(function (locale) {
              let now = Date.now();
              let p = C[channel].sample;
              let restdays = C[channel].restdays;
              let state = {updateChannel: channel, locale: locale};
                expect(R.shouldRun(state, null, {
                randomNumber: 0,
                when: now,
                lastRun: now - (restdays * days)
              }), channel + " " + locale).true();
            })
          })
        })
        it('refuses bad locale', function (done) {
          allchannels.forEach(function (channel) {
            let badlocale = "es-MX";
            let observed = events.observe(R.name, function (msg, data) {
              if (msg === "bad-locale" &&
                 data.locale === badlocale.toLowerCase()){
                done();
                events.unobserve(observed)
              }
            })
            let now = Date.now();
            let restdays = C[channel].restdays;
            let state = {updateChannel: channel, locale: badlocale};
              expect(R.shouldRun(state, null, {
              randomNumber: 0,
              when: now,
              lastRun: now - (restdays * days)
            }), channel + ' bad locale is bad').false();
          })
        })
      });

      describe("all other platforms", function () {
        it("config is overridable if needed", function () {
          let state = {updateChannel: "fakeyfake"};
          expect(R.shouldRun(state, {
            sample: 100 * percent,
            restdays: 0,
            locales: ["*"]
          },
          {lastRun: 0}
          )).to.be.true();
        });

        it("should not run, b/c no config", function(){
          ["release","aurora","beta","release"].forEach(function(c){
            let state = {updateChannel: c};
            R.shouldRun(state);
            expect(R.shouldRun(state)).to.be.false();
          });
        });

        describe("locales", function () {
          let genConfig = function (locales) {
            return {
              locales: locales,
              sample: 1, // everyone
              restdays: 0
            }
          };
          let extras = {lastRun: 0, when: Date.now()}
          it("should respect good locales", function () {
            let userstate = {locale: "it-IT"};
            let config = genConfig(['ru-RU', 'it-IT']);
            let ans = R.shouldRun(userstate, config, extras);
            expect(ans).true();
          });
          it("should respect bad locales", function () {
            let userstate = {locale: "it-IT"};
            let config = genConfig(['ru-RU']);
            let ans = R.shouldRun(userstate, config, extras);
            expect(ans).false();
          })
          it("should treat unspecified locales as NONE",
           function () {
            let userstate = {locale: "it-IT"};
            let config = genConfig();
            let ans = R.shouldRun(userstate, config, extras);
            expect(ans).false();
          });
          it("should treat * as 'any'", function () {
            let userstate = {locale: "it-IT"};
            let config = genConfig(["*"]);
            let ans = R.shouldRun(userstate, config, extras);
            expect(ans).true();
          })
        })
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
      it("should phone home correctly", function () {
        expect("tested in 'racing' exmaple").a("string");
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

      it("promises the flowid", function (done) {
        let u = uuid();
        let E = R.testable.eData;
        R.run({},{flow_id: u, simulate:true}).then( // no phoning
          (reutrned_u) => {
            expect(E.data.flows[u]).exist();
            expect(u).equal(reutrned_u);
            done();
          }
        );
      });

      it("creates flow_id if necessary", function (done) {
        let E = R.testable.eData;
        let before = Object.keys(E.data.flows);
        R.run({},{ simulate:true}).then( // no phoning
          (u) => {
            expect(u,"flow_id is string").a("string");
            expect(before, 'should not be seen before.').not.include(u);
            expect(E.data.flows[u], 'should be seen now').exist();
            done();
          }
        );
      });

      it("handles unexpected UITour messages gracefully", function (done) {
        var u = uuid();

        let toRemove = events.observe(u, (function flowListener (aEventName, aData) {
          switch (aEventName) {
            case "unexpected-tour-message": {
              expect(aData.msg).equal('weirdmessage') // lowercased
              done();
              events.unobserve(toRemove);
            }
          }
        }))

        R.run({},{flow_id: u, simulate:true}).then(
          () => {
            sendTourEvent("Heartbeat:WeirdMessage", {flowId: u});
          }
        ) // running.
        sendTourEvent("Heartbeat:WeirdMessage", {flowId: u});
      });

      // drive the Heartbeat action, even without ui!
      it("walk through two simultaneous (racing) flows, integration test, and phonesHome at each stage", function (done) {
        /**
          * 'flow' tests ensure that stages go through in order
          */

        // https://input.mozilla.org/en-US/analytics/hbdata/13948
        // https://input.mozilla.org/en-US/analytics/hbdata/13947
        let uuids = ["uuid1-racing-1", "uuid-racing-2"];

        // two at once!  wut!?
        let finished = 0;
        let numWanted = ["began", "offered", "voted", "learnmore"].length;
        let phonehomes = 0; //  numWanted per uuid

        let runs = uuids.map(function(u) {

          let E = R.testable.eData;
          delete E.data.flows[u];  // if there!

          let getSavedFlow = function (flowid) {
            return JSON.parse(localStorage[E.key]).flows[flowid];
          }

          // `events.observe` to catch rebroadcasted events at the experiment.
          let seen = {};

          let checkFinished = function () {
            if (finished === uuids.length && phonehomes === numWanted * uuids.length) {
              events.unobserve(obsPhonehome);
              events.unobserve(flowObserve);
              done() ; // the whole test!
            }
          }

          let obsPhonehome = events.observe(u, function phonehomeListener (msg, data) {
            // should see 3 phonehomes!
            if (msg === "attempted-phonehome") {
              phonehomes++;
              checkFinished(); // are we done?
            }
          });

          let flowObserve = events.observe(u, (function flowListener (aEventName, aData) {
            let msg = aEventName;
            // these all take the 'flow.data' as aData
            switch (msg) {
              case "began":
              case "offered":
              case "voted":
              case "learnmore": {
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
                    offered: true,
                    learnmore: true
                  })
                  finished++;
                  checkFinished();
                }

                if (msg === "learnmore") {
                  expect(aData.flow_links.length, "has link").equal(1);
                  expect(aData.flow_links[0].length, "link have 3 parts").equal(3);
                  expect(aData.flow_links[0][2], "came from a notice").equal("notice");
                }
                break;
              }
              default:
                break;
            }
          }))

          return R.run({},{flow_id: u, simulate:false}); // running.
        });

        // WAIT UNTIL ALL READY
        // similuate how tour events will come through.
        // NOT a test of sending messages out of order.
        // send the messages interleaved.
        Promise.all(runs).then(function () {
          sendTourEvent("Heartbeat:NotificationOffered", {flowId: uuids[0]});
          sendTourEvent("Heartbeat:NotificationOffered", {flowId: uuids[1]});
          sendTourEvent("Heartbeat:LearnMore", {flowId: uuids[0]});
          sendTourEvent("Heartbeat:LearnMore", {flowId: uuids[1]});
          sendTourEvent("Heartbeat:Voted", {flowId: uuids[0], score: 3}); // has to be last
          sendTourEvent("Heartbeat:Voted", {flowId: uuids[1], score: 3}); // has to be last
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
      it("setupState makes a good eData", () => {
        let u = uuid();
        expect(R.testable.setupState(u)).a("object");
      })
    });
  });
})
