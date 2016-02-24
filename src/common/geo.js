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
// https://github.com/mozilla/snippets-service/blob/master/snippets/base/templates/base/includes/snippet_js.html#L283

"use strict";

// https://github.com/mozilla/self-repair-server/issues/239
var GEO_URL = 'https://location.services.mozilla.com/v1/country?key=fcce8909-53a6-4d26-83da-e822cdf4ac13';
var GEO_CACHE_DURATION = 1000 * 60 * 60 * 24 * (30 + Math.random()); // 30-ish days

function downloadUserCountry() {
  return fetch(GEO_URL).then((response) => {
    /*
    {
      "country_code": "US",
      "country_name": "United States",
      "fallback": "ipf"
    }*/
    return response.json()
  }).then( (data) => {
    gSnippetsMap.set('geoCountry', data["country_code"]);
    gSnippetsMap.set('geoLastUpdated', new Date());
  })
}

// Check whether we have the user's country stored and if it is still valid.
function haveUserCountry() {
  // Check if there's an existing country code to use.
  if (gSnippetsMap.get('geoCountry')) {
    // Make sure we have a valid lastUpdated date.
    var lastUpdated = Date.parse(gSnippetsMap.get('geoLastUpdated'));
    if (lastUpdated) {
      // Make sure that it is past the lastUpdated date.
      var now = new Date();
      if (now < lastUpdated + GEO_CACHE_DURATION) {
        return true;
      }
    }
  }
  return false;
}

function getUserCountry() {
  if (haveUserCountry()) {
    return Promise.resolve(gSnippetsMap.get('geoCountry').toLowerCase());
  } else {
    return downloadUserCountry().then(() => {
      return getUserCountry();
    });
  }
}

// gSnippetsMap polyfill, available in Firefox 22 and above.
var gSnippetsMap = null;
// localStorage is available, so we wrap it with gSnippetsMap.
gSnippetsMap = {
  set: function(key, value) {
    localStorage[key] = value;
  },
  get: function(key) {
    return localStorage[key];
  }
};

// depends heavily on internals.
var reset = function reset () {
  localStorage.removeItem("geoCountry");
  localStorage.removeItem("geoLastUpdated");
};


exports.getUserCountry = getUserCountry;
exports.reset = reset;
