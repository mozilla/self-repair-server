/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/. */

/*jshint forin:true, noarg:false, noempty:true, eqeqeq:true, bitwise:true,
  strict:true, undef:true, curly:false, browser:true,
  unused:true,
  indent:2, maxerr:50, devel:true, node:true, boss:true, white:true,
  globalstrict:true, nomen:false, newcap:true, esnext: true, moz: true  */

/*global require, exports, log */

const { extend } = require("../../jetpack/object");
const { firstMatch } = require("../../common/rules");
const { Lstore } = require("../../common/recipe-utils");

let cutBreaks = function (arr, breaks, rng=Math.random()) {
  // should have tests, gah!  was not ready to deal with this yet.
  let out;
  for (let ii = 0; ii < breaks.length; ii++) {
    if (rng <= breaks[ii]) {
      return arr[ii];
    }
  }
};


var getEngagementUrl = function(obj, engagementRules, rng=Math.random()) {
  let ans;
  let rules = engagementRules.map((x)=>x.rule);
  let ruleIndex = firstMatch(obj, rules);
  if (ruleIndex >= 0) {
    let possibles = engagementRules[ruleIndex];
    let url = cutBreaks(possibles.urls, possibles.breaks, rng)
    if (url && (url.indexOf("qsurvey") >= 0)) {
      url = url + `?source=heartbeat&surveyversion=${obj.VERSION}&updateChannel=${obj.updateChannel}&fxVersion=${obj.fxVersion}`
    }
    return url
  }
  return null
}

var _increasing = function (anArray) {
   return anArray.map((k,i,arr) => {return (i == 0 || arr[i] > arr[i-1])}).every(Boolean)
}


function setupState(key, storage=localStorage) {
  var eData = new Lstore(key, storage).revive().store();  // create or revive
  if (! eData.data.flows) eData.data.flows = {};
  if (! eData.data.lastRun) eData.data.lastRun = 0;
  eData.store();
  return eData;
};

function waitedEnough(restDays, last, now=Date.now()) {
  let days = 1000 * 86400;
  let dayspassed = ((now - last)/days);
  return dayspassed >= restDays ;
};

module.exports = {
  cutBreaks: cutBreaks,
  getEngagementUrl: getEngagementUrl,
  _increasing: _increasing,
  setupState: setupState,
  waitedEnough: waitedEnough
}
