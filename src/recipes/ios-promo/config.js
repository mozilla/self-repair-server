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

//Gets a random branch (even distribution)
let getbranch = function(branches) {
  let myRng = Math.random();
  let num_branches = branches.length;
  for (var i = 1; i <= num_branches ; i++) {
    if (myRng < (i/(num_branches))) {
      return branches[i-1];
    }
  }
};

let thankyou = "We hope that you enjoy Firefox on your mobile device!";
let url      = "https://www.mozilla.org/en-US/firefox/mobile-download/";
let button   = "Get it now";
let branches = [
  {
    name:     "tabs",
    prompt:   "Take your open tabs on the road with you when using Firefox for iOS and Android.",
    thankyou: thankyou,
    url:      url,
    button:   button
  },
  {
    name:     "general",
    prompt:   "Get Firefox on your iOS and Android devices.",
    thankyou: thankyou,
    url:      url,
    button:   button
  },
  {
    name:     "bookmarks",
    prompt:   "Bring your bookmarks & passwords with you. Firefox is now on iOS & Android.",
    thankyou: thankyou,
    url:      url,
    button:   button
  }
];

let branch = getbranch(branches);

module.exports = {
  study: {
    branch: branch,
    name: branch.name,
    key: 'marketing',
    version: 1,
    delay: 60 * 1000 * (1 + 4*Math.random()), // Delay the start by 1-5 minutes
    //phonehomepct: .01*percent
  },
  channels: {
    all: {
      sample: 1 * percent, // will be 1.0 when we launch
      restdays: 1000,
      locales: ["en-CA"], // will be en-* locales when we launch
    }
  }
};
