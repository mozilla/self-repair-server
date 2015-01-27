/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/. */

/*jshint forin:true, noarg:false, noempty:true, eqeqeq:true, bitwise:true,
  strict:true, undef:true, curly:false, browser:true,
  unused:true,
  indent:2, maxerr:50, devel:true, node:true, boss:true, white:true,
  globalstrict:true, nomen:false, newcap:true, esnext: true, moz: true  */

/*global require, exports, log */

"use strict";

let million = Math.pow(10,6);
let thousand = Math.pow(10,3);
let percent = 0.01;
let days = 24 * 60 * 60 * 1000;

/*
  days since last ask?  -- function or constant?

*/

module.exports = {
  "nightly": {
    rest: 30 * days,
    sample: 100 * percent
  },
  "aurora": {
    rest: 0 * days,
    sample: 100 * percent
  }
};

