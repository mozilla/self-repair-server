/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/. */

/*jshint forin:true, noarg:false, noempty:true, eqeqeq:true, bitwise:true,
  strict:true, undef:true, curly:false, browser:true,
  unused:true,
  indent:2, maxerr:50, devel:true, node:true, boss:true, white:true,
  globalstrict:true, nomen:false, newcap:true, esnext: true, moz: true  */

/*global require, console, exports, geoip_country_code */

// adapted from:

"use strict";

// bascially, if we think it's august 2015, do a special rollout, otherwise,
// don't.

const geo = require("./geo");
const fakeUserCountry = () => Promise.resolve("--");


`logic

1.  is it august 2015?  If so, answer proporitional to day
2.  else:  just answer, darn it
`

var useReal = function (now=new Date(), rng=Math.random()) {
  var d = now.getDate(),
      m = now.getMonth(),
      y = now.getFullYear();

  // false ONLY in 2015/Aug *and* 'too early'
  if (y === 2015 && m === 7) {
    // 32 so there is no chance of a divide by zero.
    return rng < (1 / (32 - d))
  } else {
    return true;
  }

  return ans
}

var maybeGetUserCountry = function (real) {
  if (real === undefined) real = useReal();
  if (real) return geo.getUserCountry();
  else return fakeUserCountry();
}

exports.getUserCountry = maybeGetUserCountry;
exports.reset = geo.reset;
exports.useReal = useReal;
