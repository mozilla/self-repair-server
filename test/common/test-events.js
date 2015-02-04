/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/. */

/*jshint forin:true, noarg:false, noempty:true, eqeqeq:true, bitwise:true,
  strict:true, undef:true, curly:false, browser:true,
  unused:true,
  indent:2, maxerr:50, devel:true, node:true, boss:true, white:true,
  globalstrict:true, nomen:false, newcap:true, esnext: true, moz: true,
  asi:true
  */

/*global describe, it, require */

"use strict";


/* this code mostly exists
   - for coverage sake
   - catch when new actions are added
*/
let { expect } = require("chai");
let events = require("../../src/common/events");
require("../utils").shimTodo(it);

let uuid = require("node-uuid").v4;

describe("events", () => {
  it("has these methods", ()=>{
    let wanted = ["dispatchEvent", "message", "observe", "unobserve"];
    expect(events).keys(wanted);
    wanted.forEach((k)=>{
      expect(events).respondTo(k)
    })
  })
})

describe("message work in window", function(){
  it("can be sent and received", function(done){
    let U = uuid();
    let count = 0;

    events.observe(U, function (aMessage, aData) {
      switch (aMessage) {
        case 'dispatch':
          expect(aData).deep.equal({src:'dispatch'});
          break;
        case 'message':
          expect(aData).deep.equal({src:'message'});
          break;
      }
      count++;
      if (count === 2) {
        done();
      }
    });

    events.dispatchEvent(document, U, {event: "dispatch", params: {"src":"dispatch"}})
    events.message(U, "message", {src:'message'});
  });

  it("unobserve removes and observer", function (done) {
    // setup for the test.
    let U = uuid();
    let seen = 0;
    let otherseen = 0;
    let removalInstructions = events.observe(U, function () {
      seen += 1;
      events.unobserve(removalInstructions); // self removing.
    })

    let otherObserver = events.observe(U, function () {
      otherseen += 1;
    })

    // the actual test.
    setTimeout(function () {
      expect(seen).equal(1);
      expect(otherseen).equal(3);
      done();
    }, 500)

    events.message(U);
    events.message(U);  // otherseen++
    events.message(U);  // otherseen++

  });

});
