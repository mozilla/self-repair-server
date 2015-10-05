/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/. */

/*jshint forin:true, noarg:false, noempty:true, eqeqeq:true, bitwise:true,
  strict:true, undef:true, curly:false, browser:true,
  unused:true, indent:2, maxerr:50, devel:true, node:true, boss:true,
  white:true, globalstrict:true, nomen:false, newcap:true, esnext: true,
  moz: true, asi: true  */

/*global module */

"use strict";

// Multipliers are unbounded
// Multipliers are 1/(average adoption rate) where average adoption rate is for
// versions 36-40.  This is for the first 3 weeks of a release; after that
// we plateau enough to call it 1.0
// Assume that releases occur at 9:00AM PDT

const RELEASEDATESAMPLING = {
  42: {
    "release": {
      "multipliers":  [154.63, 22.25, 10.33, 7.08, 5.80, 4.81, 3.97,
                      2.94,  2.32,  1.97, 1.74, 1.59, 1.48, 1.36,
                      1.28,  1.22,  1.18, 1.15, 1.13, 1.11, 1.09
                      // , 1.0, 1.0, ...
                    ],
      "releaseDateString": "Tue Nov 03 2015 9:00:00 GMT-0700 (PDT)"
    }
  }
};

const DEFAULTMULTIPLIER = 1.0;
const MILLIS = 24 * 60 * 60 * 1000;

/**
  * Returns a multiplier given a userstate (version, channel + current date)
  * Note that this needs to remain step-wise by day to prevent geo-biasing
  *
  * Args:
  *
  * userstate
  * - updateChannel
  * - fxVersion
  *
  * extras: for testing  (optional)
  * - updateChannel (to use with allconfigs)
  * - fxVersion
  * - currentDate
  * - releaseDateSampling
  * - defaultMultiplier
  */
let releaseDateMultiplier = function(userstate = {}, extras = {}) {

  // Resolve parameters
  let fxVersion = extras.fxVersion || userstate.fxVersion || "unknown";
  let version = 1 * (fxVersion.match(/^[0-9]+/) || 0);

  let channel = extras.updateChannel || userstate.updateChannel || "unknown";
  let releaseDateSampling = extras.releaseDateSampling || RELEASEDATESAMPLING;
  let defaultMultiplier = extras.defaultMultiplier || DEFAULTMULTIPLIER;

  // Get sampling for this version/channel
  let sampling;
  if ( (releaseDateSampling[version] && releaseDateSampling[version][channel])
      === undefined ) {
    return defaultMultiplier;
  } else {
    sampling = releaseDateSampling[version][channel];
  };

  let currentDate = Date.parse(extras.currentDate || Date());
  let releaseDate = Date.parse(sampling.releaseDateString);
  let daysDiff    = Math.floor( (currentDate - releaseDate) / MILLIS );

  let multiplier  = sampling.multipliers[daysDiff] || defaultMultiplier;
  return multiplier;
};



module.exports = {
  releaseDateMultiplier: releaseDateMultiplier,
};
