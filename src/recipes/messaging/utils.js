/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/. */

/*jshint forin:true, noarg:false, noempty:true, eqeqeq:true, bitwise:true,
  strict:true, undef:true, curly:false, browser:true,
  unused:true,
  indent:2, maxerr:50, devel:true, node:true, boss:true, white:true,
  globalstrict:true, nomen:false, newcap:true, esnext: true, moz: true  */

/*global require, exports, log */

const { merge } = require("../../jetpack/object");
const { firstMatch } = require("../../common/rules");
const { Lstore } = require("../../common/recipe-utils");

const { cutBreaks, _increasing, waitedEnough } = require("../heartbeat-by-user-first-impression/utils");

var getMessage = function(obj, messages, rng=Math.random()) {
  let ans;
  let rules = messages.map((x)=>x.rule);
  let ruleIndex = firstMatch(obj, rules);
  if (ruleIndex >= 0) {
    let possibles = messages[ruleIndex];
    let ans = cutBreaks(possibles.choices, possibles.breaks, rng);
    if (ans) {
      ans = merge({},ans);  // copy
      let url = ans.url;
      if (url && (url.indexOf("qsurvey") >= 0)) {
        //let fullUrl = `${branch.url}?source=hb&hbv=${VERSION}` +
        //    `&c=${state.updateChannel}&v=${state.fxVersion}&l=${state.locale}` +
        //    `&b=${branch.name}`;//&g=${geoAus}
        url = url + `?source=messaging&surveyversion=${obj.VERSION}`+
          `&updateChannel=${obj.updateChannel}`+
          `&fxVersion=${obj.fxVersion}` +
          `&locale=${obj.locale}` +
          `&variation=${ans.name}`
        ans.url = url;  // copy
      }
    }
    return ans
  }
  return null
}


// differs from the hb-1st one.
function setupState(key, storage=localStorage) {
  var eData = new Lstore(key, storage).revive().store();  // create or revive
  if (! eData.data.flows) eData.data.flows = {};
  if (! eData.data.lastRun) eData.data.lastRun = 0;

  // messages seen, by name
  if (! eData.data.seen) eData.data.seen = {};

  eData.store();
  return eData;
};


module.exports = {
  cutBreaks: cutBreaks,
  getMessage: getMessage,
  _increasing: _increasing,
  setupState: setupState,
  waitedEnough: waitedEnough
}
