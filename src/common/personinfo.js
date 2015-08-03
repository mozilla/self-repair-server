/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/. */

/*jshint forin:true, noarg:false, noempty:true, eqeqeq:true, bitwise:true,
  strict:true, undef:true, curly:false, browser:true,
  unused:true,
  indent:2, maxerr:50, devel:true, node:true, boss:true, white:true,
  globalstrict:true, nomen:false, newcap:true, esnext: true, moz: true  */

/*global require, console, exports */

"use strict";

let UITour = require("thirdparty/uitour");
let { merge, extend } = require("../jetpack/object");
let type = require("../jetpack/type");

//const { getUserCountry } = require("./geo");
const getUserCountry = () => Promise.resolve("--");

let config = exports.config = {
  overrides: {},
  timeout: 5000
};

// wants TONS MORE DATA.  Day of cycle, etc.
// TODO, this in theory can have to wait forever, if something goes wrong.
// TODO this is super tied to the tour, but won't be in future.
// should be tied to about:support API

/** Promise personinfo object
  *
  * tour: a tourUi object
  *
  * aConfig:  (extends module config)
  * - overrides:  {}  // note, only common keys will override.
  *                   // this is not an 'extras'
  * - timeout (time to wait)
  *
  *
  */

let personinfo = function (tour, aConfig) {
  // resolves two places...
  // 1. timeout, if takes too long.  contorlled by aConfig.timeout;
  // 2. onGet, if all providers are accounted for.

  aConfig = extend({}, config, aConfig || {});
  return new Promise (function (resolve, reject) {
    // both shims
    let already = false;

    // for cleaning up after data is gotten, to ensure overrides stick.
    var revise = (out, over) => {
      over = over || aConfig.overrides;
      if (over && type.isObject(over) && Object.keys(over).length) {
        merge(out, over);
        out.flags.overrides = over; // see what was changed?
      }
      return out;
    };


    // the output data structure.
    let out = {
      updateChannel:  "unknown",
      fxVersion: "unknown",
      locale: "unknown",
      country: "unknown",  // to match the upload spec
      flags: {
      }
    };

    tour = tour || UITour;

    // ## providers
    let avail = ["sync","appinfo","availableTargets","selectedSearchEngine"];
    // add new providers here, so that the time out and message mechanism works.
    let nontour = ['country'];

    // listen for all providers
    let wanted = avail.length; + nontour.length;
    let got = 0;
    let onGet = function (which, data) {
      //console.log(which, data);
      switch (which) {
        case "appinfo": {
          out.updateChannel = data.defaultUpdateChannel;
          out.fxVersion = data.version;
          break;
        }

        case "sync":
        case "selectedSearchEngine":
        case "availableTargets":
          break;

        case "country": {
          out.country = data;
          break;
        }

        default:
          break;
      }
      // ugh, this is gross
      got++;
      if (got >= wanted) {
        already = true;
        resolve(revise(out));  // revise allows overrides to come through
      }
    };
    avail.map(function (which) {
      tour.getConfiguration(which,function(data) {onGet(which,data);});
    });

    // get the geo stuff.
    getUserCountry().then((ans)=> onGet('country',ans));

    // time out if it takes too long.
    setTimeout(
      () => {
        if (already) return true;

        out.flags.timeout = aConfig.timeout;
        out.flags.incomplete = true;
        resolve(revise(out));
      },
      aConfig.timeout);
  });
};

exports.personinfo = personinfo;


/*

Old style from sdk

const promises = require("sdk/core/promise");
const { defer } = promises;
const { extend } = require("sdk/util/object");

const genPrefs = require("sdk/preferences/service");

const FHR = require("./FHR");
const micropilot = require("micropilot-trimmed");

function getAddonVersion(){
  return require("sdk/self").version;
}

// parses the fhr 'data' object and calls the callback function when the result is ready.

function parseFHRpayload (data) {
  console.log("parsing FHR payload");

  var days = data.data.days;
  var nowDate = new Date();
  var todayDate = new Date(nowDate.getFullYear(), nowDate.getMonth(), nowDate.getDate(), 0, 0 ,0, 0);

  var aMonthAgoDate = new Date(todayDate.getTime() - 30 * 24 * 3600 * 1000);
  let sumMs = 0;
  var profileAgeDays = Date.now()/(86400*1000) - data.data.last["org.mozilla.profile.age"].profileCreation;
  var useddays30 = 0;

  let crashes = {
    total: 0,
    submitted: 0,
    pending: 0
  };

  for (var key in days){
    if (days.hasOwnProperty(key)){
      // crashes:
      let crash = days[key]["org.mozilla.crashes.crashes"];
      if (crash) {
        let p = crash.pending || 0;
        let s = crash.submitted || 0;
        crashes.total += p + s;
        crashes.pending += p;
        crashes.submitted += s;
      }

      var dateRegExp = new RegExp("(.*)-(.*)-(.*)");
      var allQs = dateRegExp.exec(key);
      let date = new Date(parseInt(allQs[1], 10), parseInt(allQs[2] - 1, 10), parseInt(allQs[3], 10), 0, 0, 0, 0);
      if (date >= aMonthAgoDate && date < todayDate) {
        if (days[key]["org.mozilla.appSessions.previous"]) {
          if (days[key]["org.mozilla.appSessions.previous"].cleanActiveTicks) {
            useddays30 += 1;
            days[key]["org.mozilla.appSessions.previous"].cleanActiveTicks.forEach(function (elm) {
                sumMs = sumMs + elm * 5 * 1000;
            });
          }
        }
      }
    }
  }
  return {useddays30: useddays30 , profileageCeilingCapped365: Math.min(365, Math.ceil(profileAgeDays || 1)), sumMs30: sumMs, crashes: crashes};
}


function transformFhrData () {
  let {promise, resolve} = defer();
  console.log("starting to get FHR data");
  if (!FHR.reporter) resolve({});

  FHR.reporter.onInit().then(function() {
    return FHR.reporter.collectAndObtainJSONPayload(true);
  }).then(function(data) {
    resolve(parseFHRpayload(data));
  });
  return promise;
}

// alas, has to be async, stupid addons!
let getData = exports.getData = function () {
  let {promise, resolve} = defer();
  let d;

  let annotatePrefs = function () {
    d.prefs = {};
    [ // "browser.search.defaultenginename",
      // "privacy.donottrackheader.enabled",
      // "privacy.donottrackheader.value",
      // "places.history.enabled",
      "distribution.id",
      "gecko.buildID"
      ].forEach(function(k) {
        d.prefs[k] = genPrefs.get(k);
      });
  };

  micropilot.snoop().then(
  (data) => d = data).then(
  () => d.addonVersion = getAddonVersion()).then(
  transformFhrData).then(  // FHR, then transform it
  (transformed) => d = extend({},d,transformed)).then(
  annotatePrefs).then( // get some good prefs
  () =>resolve(d));

  return promise;
};

*/
