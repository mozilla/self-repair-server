/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/. */

/*jshint forin:true, noarg:false, noempty:true, eqeqeq:true, bitwise:true,
  strict:true, undef:true, curly:false, browser:true,
  unused:true,
  indent:2, maxerr:50, devel:true, node:true, boss:true, white:true,
  globalstrict:true, nomen:false, newcap:true, esnext: true, moz: true  */

/*global describe, it, require */


/** CORS test script

tools > web developer > web console.

Paste and run.

Results:
- if CORS off, will `console.log` about it.
- else will log 201, or 400.
*/

"use strict";

let { expect } = require("chai");
require("./utils").shimTodo(it);

let request = require("../src/common/request");

var cors = function(url, dataObject) {
  return request.request(url, "post", dataObject, null, "application/json");
};

var data = function (id) {
  return {
    "person_id": "gregg",
    "survey_id": id || "lunch",
    "flow_id": "12345",
    "experiment_version": "1",
    "response_version": 1,
    "question_id": "howwaslunch",
    "question_text": "how was lunch?",
    "variation_id": "1",
    "updated_ts": Date.now(),
    "is_test": true
  };
};


// traceur + 'arrow' is badpants here.
// https://github.com/domenic/mocha-traceur/issues/2
// manifests as: TypeError: Object #<Object> has no method 'timeout'

describe("hb upload nervousness", ()=> it.todo("these tests might not work", new Function()));

describe("hb server", function () {
  describe("hb server is up", function () {
    it("should accept input", function (done) {
      let isdone = false;
      let safedone = function (a) {
        if (!isdone) {isdone=true; expect(true).true(); done(a)}
      };

      this.timeout(5000);
      //setTimeout(
      //  () => {
      //    it.todo("hb server is down, or CORS is wrong", new Function());
      //    safedone();
      //  },
      //  4500
      //);
      cors("https://input.mozilla.org/api/v2/hb/",
      data("lunch")).then(
        ()=>safedone(),
        (err) => {it.todo("hb server catchable error" + err, new Function())} // warn
      );
    });

    // this leads to garbage loglines at
    // https://input.mozilla.org/en-US/analytics/hberrorlog
    // but now works properly, fixed, but disabled at  #75
    it.skip("should not accept garbage input", function (done) {
      let isdone = false;
      let safedone = function (a) {
        if (!isdone) {isdone=true; expect(true).true(); done(a)}
      };

      this.timeout(2000);
      //setTimeout(
      //  () => {
      //    it.todo("hb server is down, or CORS is wrong", new Function());
      //    safedone();
      //  },
      //  1800
      //);
      cors("https://input.mozilla.org/api/v2/hb/",
       {garbage: data()}).then(
        () => safedone(new Error("no garbage!")),
        () => safedone() // should reject, ok
      );
    });
  });


  describe("some garbage server will CORS reject", () => {
    it("should not exist", function (done) {
      let isdone = false;
      let safedone = function (a) {
        if (!isdone) {isdone=true; expect(true).true(); done(a);}
      };
      this.timeout(500);
      setTimeout(
        () => {
          // server not responding; CORS is wrong AS EXPECTED"
          safedone();
        },
        300
      );
      cors("https://some.totally.random-garbage-server.nontld",
      data("lunch")).then(
        () => safedone(new Error("should not exist!")),
        () => safedone
        ()
      );
    });
  });
});

