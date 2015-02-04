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

let assert = require("assert");
require("./utils").shimTodo(it);

var cors = function(url, dataObject) {
  return new Promise(function(resolve, reject) {
    var req = new XMLHttpRequest();
    req.open('post', url);
    req.setRequestHeader("Content-Type", 'application/json');  // will trigger pre-flight

    req.onload = function() {
      if ((req.status >= 200 && req.status < 300) || req.status == 0) {
        resolve(req);
      } else {
        reject(new Error(req.status));
      }
    };

    req.onerror = function(e) {
      //console.error(Error('Network Error'));
      reject(Error('Network Error'));
    };

    req.send(JSON.stringify(dataObject || {}));
  });
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

describe("hb server is up", function () {
  it("should accept input", function (done) {
    let isdone = false;
    let safedone = function (a) {
      if (!isdone) {isdone=true; done(a)}
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

  it("should not accept garbage input", function (done) {
    let isdone = false;
    let safedone = function (a) {
      if (!isdone) {isdone=true; done(a)}
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
     {garbage: data}).then(
      () => safedone(new Error("no garbage!")),
      () => safedone() // should reject, ok
    );
  });
});


describe("some garbage server", () => {
  it("should not exist", function (done) {
    let isdone = false;
    let safedone = function (a) {
      if (!isdone) {isdone=true; done(a);}
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
