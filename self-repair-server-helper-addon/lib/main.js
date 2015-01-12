/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/. */

/*jshint forin:true, noarg:false, noempty:true, eqeqeq:true, bitwise:true,
  strict:true, undef:true, curly:false, browser:true,
  unused:true,
  indent:2, maxerr:50, devel:true, node:true, boss:true, white:true,
  globalstrict:true, nomen:false, newcap:true, esnext: true, moz: true  */

/*global require, exports, console */

"use strict";

let prefSvc = require("sdk/preferences/service");

let {Cc, Cu} = require("chrome");

// services
let {Services} = Cu.import("resource://gre/modules/Services.jsm");

let simpleprefs = require("sdk/simple-prefs");

let data = require("sdk/self").data;

let addPerm = function (uri) {
  console.log("ADDING:", uri);
  let pageURI = Services.io.newURI(uri, null, null);
  Services.perms.add(pageURI, "uitour", Services.perms.ALLOW_ACTION);
  console.log("ADDED:", uri);
};

simpleprefs.on("uri", function () {
  addPerm(simpleprefs.prefs.uri);
});


/* set pref, open "tour" page */
exports.main = function () {
  simpleprefs.prefs.uri = data.url("tour.html");
  require("sdk/tabs").open(simpleprefs.prefs.uri);
};


require("sdk/system/unload").when(function () {
});
