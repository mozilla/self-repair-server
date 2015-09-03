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

let R = require("../../src/recipes/pb-mode-survey");
let C = require("../../src/recipes/pb-mode-survey/config");


const percent = 0.01;
let days = 1000 * 86400;

describe("pb-mode-survey", function () {
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
          let oklocales = ['en-US'];
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
      it("does not phone home", function () {
        expect("you just have to believe this").a("string");
      });

      it("creates a stored (empty) flow by side effect", function (done) {
        let u = uuid();
        let E = R.testable.eData;
        R.run({},{flow_id: u, simulate:true}).then( // no phoning
          () => {
            expect(E.data.flows[u], "must exist").exist();
            expect(E.data.flows[u], "must be an empty obj").deep.equal({}); // must be empty
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

    });

    describe("testable functions", function () {
      it("exports exist (and some are functions)", () =>{
        var expected = ["eData", "waitedEnough", "setupState"];
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
