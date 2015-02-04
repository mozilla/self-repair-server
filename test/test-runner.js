/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/. */

/*jshint forin:true, noarg:false, noempty:true, eqeqeq:true, bitwise:true,
  strict:true, undef:true, curly:false, browser:true,
  unused:true,
  indent:2, maxerr:50, devel:true, node:true, boss:true, white:true,
  globalstrict:true, nomen:false, newcap:true, esnext: true, moz: true  */

/*global describe, it, require, setTimeout */

"use strict";

let { expect } = require("chai");
require("./utils").shimTodo(it);

let runner = require("../src/runner");

let goodConfig = {
  name: 'goodConfig',
  description: 'b',
  version: 1,
  owner: "Nobody <nobody@nowhere.com>",
  shouldRun: () => true,
  run: function (state) { return Promise.resolve(true)}
};

let neverRun = {
  name: 'neverRun',
  description: 'shouldRun is false',
  version: 1,
  owner: "Nobody <nobody@nowhere.com>",
  run: function (state) { return Promise.resolve(true)},
  shouldRun: () => false,
};

let ok = function (done, o, status, badmsg) {

  /* istanbul ignore if */
  if (!(runner.validateRunAttempt(o))[1]) {
    done(new Error("unexpected invalid run attempt obj"));
  }
  if (o.status === status) { done(); }
  else {
    let msg = badmsg || ("status should be " + status + " not " + o.status);
    done(new Error(msg));
  }
};

describe("runner validates", function () {
  it("a valid config validates", function () {
    expect(runner.validateConfig(goodConfig)[1]).to.be.true;
    expect(runner.validateConfig(neverRun)[1]).to.be.true;
  });
  it("goodConfig needs all the keys", function () {
    let moreBrokenConf = {};
    let nummissing = 0;
    Object.assign(moreBrokenConf, goodConfig); // clone enumerables;
    for (let key in goodConfig) {
      let conf = {};
      Object.assign(conf, goodConfig); // clone enumerables;
      delete conf[key];
      let valid = runner.validateConfig(conf);
      expect(valid[1]).to.be.false;
      expect(valid[0]).to.have.length(1);  // one error.

      // cumulative brokenness;
      delete moreBrokenConf[key];
      nummissing++;
      valid = runner.validateConfig(moreBrokenConf);
      expect(valid[1]).to.be.false;
      expect(valid[0]).to.have.length(nummissing);  // one error.
    }
  });
  it.todo('should allow eligible / shouldRun to be an array', function() {
    // the idea here is to allow it to be an array of dsl style
    // rules.  see issues/20
  });
});

describe("attemptRun", function () {
  it("returns a promise", function () {
    expect(runner.attemptRun({}, {})).to.respondTo("then");
  });
  it("promises a run attempt", function (done) {
    runner.attemptRun(goodConfig, {}).then(
    (o)=>{
      let valid = runner.validateRunAttempt(o);

      let err = valid[1] ? undefined : new Error("invalid");
      done(err);
    }, // or
    (err) => done(err)
    );
  });
  describe("effects of config.alwaysRun", function () {
    it("runs when valid", function (done) {
      runner.attemptRun(neverRun, {}, {alwaysRun: true}).then(
        (o) => ok(done, o, "ok"),
        () => done(new Error("should run, not reject"))
      );
    });
    it("does not run if not valid", function (done) {
      runner.attemptRun(neverRun, {}, {alwaysRun: false}).then(
        (o) => ok(done, o, "not-run"),
        () => done(new Error("should run, not reject"))
      );
    });
    it("default is false", function (done) {
      runner.attemptRun(neverRun, {}).then(
        (o) => ok(done, o, "not-run"),
        () => done(new Error("should run, not reject"))
      );
    });
  });
  describe("only exceptions cause reject", function () {
    // GRL, not sure about this.  mostly reject so we can log and freak out.
    // though maybe even these are fine to do with status?
    it("exceptions in `run` cause reject", function (done) {
      let throwconf = {};
      throwconf = Object.assign(throwconf, goodConfig);
      throwconf.run = function () { throw new Error("oh no!");};
      runner.attemptRun(throwconf, {}).then(
        () => done(new Error("should reject")),
        (o) => ok(done, o, 'exception')
      );
    });
  });

  describe("run rejects are handled", function () {
    // GRL, not sure about this.  mostly reject so we can log and freak out.
    // though maybe even these are fine to do with status?
    it("by status = `run-rejected`", function (done) {
      let rejectconf = {};
      rejectconf = Object.assign(rejectconf, goodConfig);
      rejectconf.run = () => Promise.reject(false);
      runner.attemptRun(rejectconf, {}).then(
        () => done(new Error("should reject")),
        (o) => ok(done, o, 'run-rejected')
      );
    });

    it("async run reject", function (done) {
      let rejectconf = {};
      rejectconf = Object.assign(rejectconf, goodConfig);
      rejectconf.run = function () {
        return new Promise(function (resolve, reject) {
          setTimeout(function () {reject("oh no!");}, 600);
        });
      };
      rejectconf.name = "rejectconf-async";
      runner.attemptRun(rejectconf, {}).then(
        () => done(new Error("should reject")),
        (o) => ok(done, o, 'run-rejected')
      );
    });
  });

  describe("shape of runAttempts", function(){
    it.todo("errors have shape", function(){
    });
    it.todo("success have shape", function(){});
  });
});


describe("runAll", function () {

  it("returns a promise", function () {
    expect(runner.runAll([], {})).to.respondTo("then");
  });

  it("promises a list of results", function (done) {
    runner.runAll([], {}).then(
      (p) => {
        expect(p).an("array");
        done();
      }
    );
  });

  it("handles when recipes dont run (validation)", (done)=> {
    runner.runAll([neverRun, neverRun], {}).then(
      (p) => {
        expect(p).an("array");
        expect(p).have.length(2);
        expect(p.map((o)=>o.status)).deep.equal(['not-run','not-run']);
        done();
      }
    );
  });

  it("handles when recipes throw", (done)=> {
    let throwconf = {};
    throwconf = Object.assign(throwconf, goodConfig);
    throwconf.run = function () { throw new Error("oh no!");};
    throwconf.name = 'throwConf';
    runner.attemptRun(throwconf, {}).then(
      () => done(new Error("should reject")),
      (o) => ok(done, o, 'exception')
    );

    runner.runAll([throwconf, throwconf], {}).then(
      (p) => {
        expect(p).an("array");
        expect(p).have.length(2);
        expect(p.map((o)=>o.status)).deep.equal(['exception', 'exception']);
        done();
      }
    );
  });

  it("runs recipes in order, mixture of states, one at a time, with variable timings", function (done) {
    let rejectconf = {};
    rejectconf = Object.assign(rejectconf, goodConfig);
    rejectconf.run = function () {
      return new Promise(function (resolve, reject) {
        setTimeout(function () {reject("no!");}, 600);
      });
    };
    rejectconf.name = "async-reject";

    runner.runAll([rejectconf, neverRun, goodConfig], {}).then(
      (p) => {
        expect(p).an("array");
        expect(p).have.length(3);
        expect(p.map((o)=>o.status)).deep.equal(['run-rejected', 'not-run', 'ok']);
        expect(p.map((o)=>o.name)).deep.equal(['async-reject', 'neverRun', 'goodConfig']);
        done();
      }
    );
  });

  it('actually runs all the run functions', (done) => {
    let count = 0;
    let conf = Object.assign({}, goodConfig);
    conf.name='actionconf';
    conf.run = () => {count++; return Promise.resolve('ok')};
    runner.runAll([conf, conf], {}, {alwaysRun: true}).then(
      () => expect(count).equal(2) && done(),
      () => done(new Error("should run, not reject"))
    );
  });

  describe("effects of state", function () {
    it('state should get re-called between recipes, if a fn()', (done) => {
      let count = 0;
      let stateFn = () => {count++; return Promise.resolve({});};
      runner.runAll([goodConfig,goodConfig], stateFn, {alwaysRun: true}).then(
        () => expect(count).equal(2) && done(),
        () => done(new Error("should run, not reject"))
      );
    });

    it('state affects runs', (done) => {
      // state machinery
      let attemptedFixes = 0;
      let canonicalState = {hasBadAddon: true};
      expect(canonicalState.hasBadAddon).true();
      let stateFn = () => {return Promise.resolve(canonicalState);};
      stateFn().then(
        (state) => expect(state.hasBadAddon).true()
      );

      // simulate synchronous addon removal recipe.
      let fixBadAddon = {
        name: 'fix-bad-addon',
        description: `if the config has the evil addon, run and remove it`,
        version: 1,
        owner: "Nobody <nobody@nowhere.com>",
        run: function (state) {
          attemptedFixes++;
          if (!state.hasBadAddon) return Promise.resolve("already fixed");

          // assumes we can backdoor canonical state
          // could in theory re-check state if needed
          canonicalState.hasBadAddon = false; // fix it, assume sync
          return Promise.resolve("fixed!");
        },
        shouldRun: (state) => state.hasBadAddon,
      };

      // do fix first time, then skip (already fixed!)
      runner.runAll([fixBadAddon, fixBadAddon, fixBadAddon], stateFn).then(
        (p) => {
          expect(attemptedFixes).equals(1); // run() counter!
          expect(p).an("array");
          expect(p).have.length(3);

          expect(p.map((o)=>o.status)).deep.equal(['ok', 'not-run', 'not-run']);
          stateFn().then(
            (state) => {expect(state.hasBadAddon).false();}
          );
          expect(canonicalState.hasBadAddon).false();
          done();
        },
        () => done(new Error("should run, not reject"))
      );
    });
  });

  describe("effects of config.alwaysRun", function () {
    it("runs when valid", function (done) {
      runner.runAll([neverRun,neverRun], {}, {alwaysRun: true}).then(
        (p) => {
          expect(p).an("array");
          expect(p).have.length(2);
          expect(p.map((o)=>o.status)).deep.equal(['ok','ok']);
          done();
        },
        () => done(new Error("should run, not reject"))
      );
    });
    it("does not run if not valid, config is false", function (done) {
      runner.runAll([neverRun,neverRun], {}, {alwaysRun: false}).then(
        (p) => {
          expect(p).an("array");
          expect(p).have.length(2);
          expect(p.map((o)=>o.status)).deep.equal(['not-run','not-run']);
          done();
        },
        () => done(new Error("should run, not reject"))
      );
    });
  });

  describe("telemetry recording at runner", function () {
    it.todo("telemetry should record good and bad", ()=>{});
  });
});
