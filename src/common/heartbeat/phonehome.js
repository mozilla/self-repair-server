/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/. */

/*jshint forin:true, noarg:false, noempty:true, eqeqeq:true, bitwise:true,
  strict:true, undef:true, curly:false, browser:true,
  unused:true,
  indent:2, maxerr:50, devel:true, node:true, boss:true, white:true,
  globalstrict:true, nomen:false, newcap:true, esnext: true, moz: true  */

/* global require */

"use strict";

const request = require("../request").request;
const extend = require("../../jetpack/object").extend;
const personinfo = require("../personinfo");
const validate = require("./upload-validate").validate;

var log = console.log.bind(console, "phonehome"); // can't depend on actions,
  // circular dependency.

/** POST API information for Heartbeat
  * http://fjord.readthedocs.org/en/latest/hb_api.html
  */

/** base configuration of the phonehome module / function
  * (overridable from outside)
  */
let config = exports.config  = {
  phonehome: true,   // will it send?
  testing: true,     // append on a flag?
  url: "https://input.mozilla.org/api/v2/hb/",
  extraData:  null
};

/** add common fields such as timestamp, userid, etc. to event data
  * fields will be appending in newkey 'extra', which is a dict.
  *
  * Note:  modifies and returns the ORIGINAL OBJECT [1]
  *        if this is unwanted:  `annotate(extend({},obj))`
  *
  */
let annotate = function (obj) {
  return new Promise(function(resolve, reject) {
    obj = extend({}, obj);

    obj.person_id = "NA"; // myprefs.person_id;
    //obj.variation_id = TODO; //myprefs.armname;

    obj.response_version = 1;
    obj.updated_ts = Date.now();

    // TODO: does this pass the tour and config?  if so, how?
    personinfo.personinfo().then(
      function (data) {
        obj.platform = "UNK";  //data.os; // will be better
        obj.channel = data.updateChannel;
        obj.version = data.fxVersion;
        obj.locale = obj.locale || "UNK"; //TODO // data.location;

        // modified per https://bugzilla.mozilla.org/show_bug.cgi?id=1092375
        obj.build_id = "-"; //data.prefs['gecko.buildID'] || "-";
        obj.partner_id = "-"; //data.prefs['distribution.id'] || "-";
        obj.profile_age = 0; //data.profileageCeilingCapped365; // capped at 365.  rounded
        obj.profile_usage = {}; //{total30:data.sumMs30, useddays30: data.useddays30};

        obj.addons = {"addons": data.addons || []};
        obj.extra = {
          crashes: data.crashes || {},
          //prefs: data.prefs,  // dropped per https://bugzilla.mozilla.org/show_bug.cgi?id=1092375
          engage: obj.flow_links,
          numflows: 0,
          // new in #203
          searchEngine: data.searchEngine,
          syncSetup: data.syncSetup,
          defaultBrowser: data.defaultBrowser,
          plugins: data.plugins,
          flashVersion: data.flashVersion,
          doNotTrack: data.doNotTrack
        };

        obj.experiment_version = data.addonVersion || "-";

        obj.country = data.country || "unknown";
        //log("annotated", obj);
        resolve(obj);
      }
    );
  });
};


/** Send data to Heartbeat Input
  *
  *
  * args:
  *    dataObject:  POJO with event related keys, validates
  *    options:  same keys as `config`, temporarily overriding them.
  *
  * promises:
  *    Response [1][2]
  *
  *
  * Note 1: if (!options.phonehome)), return [RequestArgs] instead
  *
  * Note 2: Success will be
  *   - statusCode = 201 (input heartbeat)
  *   - statusCode = 0 (local file)
  *
  **/


let phonehome = function(dataObject, options){
  dataObject = dataObject || {};
  options = extend({}, config, options);

  dataObject.is_test = !!options.testing;

  return new Promise(function(resolve, reject) {

    let send = function (dataObject) {
      //function request(url, method, data, headers, contentType) {
      let args = [
        options.url,
        "POST", // method,
        dataObject, // content  (will be stringified)
        {'Accept': 'application/json; indent=4'}, // headers
        "application/json" // contentType:
      ];

      if (options.phonehome) { // for real.
        //log("posting");
        return request.apply(null, args);
      } else {
        //log("blocked by configuration");
        return args; /* return the Args. */
      }
    };

    /* extend ".extra" */
    let addExtra = function (dataObject) {
      if (options.extraData) {
        dataObject.extra = extend({}, dataObject.extra || {}, options.extraData);
      }
      return dataObject;
    };

    // remember, validate strips extra fields silently!
    let wrap_valid = function (d)
    {
      return new Promise(function (resolve, reject){
        try {
          resolve(validate(d)); // may turn into a reject.
        } catch (exc) {
          //log(exc);
          reject(exc);
        }
      });
    };


    /** main body */

    annotate(dataObject).then(
    addExtra).then(
    wrap_valid).then(
    send).then(
      resolve,
      reject);
  });
};

exports.phonehome = phonehome;
exports.annotate = annotate;
