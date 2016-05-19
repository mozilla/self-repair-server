/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/. */

/*jshint forin:true, noarg:false, noempty:true, eqeqeq:true, bitwise:true,
  strict:true, undef:true, curly:false, browser:true,
  unused:true,
  indent:2, maxerr:50, devel:true, node:true, boss:true, white:true,
  globalstrict:true, nomen:false, newcap:true, esnext: true, moz: true  */

/*global describe, it, require, exports, log */

/**

  RE:  https://github.com/mozilla/self-repair-server/issues/187
  These tests pull in all configs from recipes.

  This is intended to be a FRIENDLY way of trying to enforce
  dates where possible.

  The spec here:
  - name
  - dates: [{name, start, stop}, ...]
  - used:  [{name, ...}]

  Goal:

  - no surveys removed 'too soon'.
  - all surveys have expiry.

  Implies:

  - configs should export some derived key of all 'links' (urls, messages)
  - everything in USED should have an entry in the corresponding spec
    - throw if not.
    - check date if so.

*/

"use strict";

let { expect } = require("chai");

var toCheck = [
  {
    name: "heartbeat-first-impressions"
    intervals:  require("./dates-heartbeat-first-impressions").validIntervals;
    used: require("../src/recipes/heartbeat-first-impressions/config").used;
  },


]



// utilities
var DateAfter = function (strWhen) {
  // usage:  DateAfter("Sep 06 2015");
  return Date.now () >= new Date(Date.parse(strWhen))
};

var DateBefore = function (strWhen) {
  // usage:  DateAfter("Sep 06 2015");
  return Date.now () <= new Date(Date.parse(strWhen))
};

var DateBetween = function (start, end) {
  // usage:  DateAfter("Sep 06 2015");
  var now = Date.now();
  return DateAfter(start) && DateBefore(end);
};


var bomb = function (strWhen) {
  return function () { expect(DateAfter(strWhen), "Time bomb:" + strWhen).to.be.false() };
};

var digestIntervals = function (intervals) {
  let out = {};
  intervals.forEach((interval) {
    let n = interval.name;
    if (out[n] === undefined ) out[n] = [];
    out[n].push(interval);
  })
  return out;
}


describe("check all configs", function () {
  toCheck.forEach(
    (spec, i) => {

      // all the checks.
      expect(spec.intervals).to.be.an('array');
      expect(spec.used).to.be.an('array');


      // ideally, check that the intervals actually tell
      // a consistent story.  TODO
      var intervals = digestIntervals(spec.intervals);


      ans = {};  // name = bool.

      // have list of intervals, used.

      today is in the interval.
      or its not

      // A. for each USED, must have at least one valid interval.
      //    - TODO this dies on first fail.
      spec.used.forEach((used) {
        let name = used.name;
        let possible = intervals[name];
        expect(possible, name + "has no intervals at all").to.be.an("array");
        let yes = possible.map((p)=> DateBetween(p.start, p.stop))
        expect(yes.some(Boolean),name + " no valid arrays");
      })

      // B. for each interval, if valid, the key MUST be in USED.

      spec.intervals.forEach((interval){
        let name = interval.name;
        if (DateBefore(interval.start, interval.stop)) {
          expect(spec.used[name], name + " has is missing from used").to.exist()
        }
      })
    }
  )
})




describe('time bombs', function () {
  var DateAfter = function (strWhen) {
    // usage:  DateAfter("Sep 06 2015");
    return Date.now () >= new Date(Date.parse(strWhen))
  };
  var bomb = function (strWhen) {
    return function () { expect(DateAfter(strWhen), "Time bomb:" + strWhen).to.be.false() };
  };
  // one fail per line.
  //it.skip('if fail, revert sampling back (see #139)', bomb('Aug 17 2015'));

  //it('if fail, revert sampling back from 42 oversamle', bomb('Nov 9 2015'));

  it('if fail, turn off germany pbm survey re 174', bomb('Nov 15 2015'));

})




describe("repairs", function () {
  it("repairs is a list", function () {
    expect(repairs).to.be.an("array");
  });
  it("all repairs are valid repairs", function () {
    expect(repairs.every(runner.validateConfig)).to.be.true;
  })
});
