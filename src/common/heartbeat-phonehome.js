/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/. */

/*jshint forin:true, noarg:false, noempty:true, eqeqeq:true, bitwise:true,
  strict:true, undef:true, curly:false, browser:true,
  unused:true,
  indent:2, maxerr:50, devel:true, node:true, boss:true, white:true,
  globalstrict:true, nomen:false, newcap:true, esnext: true, moz: true  */

/* global */

"use strict";

const request = require("./request");
const extend = require("../jetpack/object").extend;
const personinfo = require("./personinfo");
const validate = require("./upload-validate").validate;
const flow = require("./heartbeat-flow");

let log = require("./actions").log;
log = log.bind(log, "phonehome");

/** POST API information for Heartbeat
  * http://fjord.readthedocs.org/en/latest/hb_api.html
  */

/** base configuration of the phonehome module / function
  *
  */
let config = exports.config  = {
  phonehome: true,   // will it send?
  testing: true,         // append on a flag?
  url: "https://input.mozilla.org/api/v2/hb/",
  //url: "https://testpilot.mozillalabs.com/submit/" + "pulse-uptake-experiment",
  extraData:  null
};

/** add common fields such as timestamp, userid, etc. to event data
  * fields will be appending in newkey 'extra', which is a dict.
  *
  * Note:  modifies and returns the ORIGINAL OBJECT [1]
  *        if this is unwanted:  `annotate(extend({},obj))`
  *
  */
let annotate = exports.annotate = function (obj) {
  return new Promise(function(resolve, reject) {
    obj = extend({}, obj);

    obj.person_id = "NA"; // myprefs.person_id;
    //obj.variation_id = TODO; //myprefs.armname;

    obj.response_version = 1;
    obj.updated_ts = Date.now();

    personinfo.personinfo(null,
      function (data) {
        obj.platform = "UNK";  //data.os; // will be better
        obj.channel = data.updateChannel;
        obj.version = data.fxVersion;
        obj.locale = "UNK"; //TODO // data.location;

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
          numflows: 0
        };

        obj.experiment_version = data.addonVersion || "-";

        log("annotated", obj);
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
  * Note 1: if (!options.phonehome)), return Request instead
  *
  * Note 2: Success will be
  *   - statusCode = 201 (input heartbeat)
  *   - statusCode = 0 (local file)
  *   - statusCode = ??? (other systems, mostly 200)
  *
  *
  * Note 3: payloads are finite in size (several megs?) for bagheera
  *         and will die silently (?) on rejection.
  **/

let phonehome_orig = exports.phonehome = function(dataObject, options){
//
//  dataObject = dataObject || {};
//
//  options = extend({}, config, options);
//
//  let { promise, reject, resolve } = promises.defer();
//  function requestCompleted(which, cb, response) {
//    // FUTURE: worth catching errors here?  If so, so what to do next?
//    //log("REQUEST COMPLETE", which, response.status, response.text);
//    cb(response);
//  }
//
//  dataObject.is_test = !!options.testing;
//
//  let send = function (dataObject) {
//    /** TP packet
//      * - special url
//      * - POST instead of get
//      * - explicit about content type.
//      * - will autogen a record at /bagheera end
//      */
//    var XMLReqTP = new request.Request({
//      url: options.url,
//      headers: {'Accept': 'application/json; indent=4'},
//      onComplete: requestCompleted.bind(null,"HeartbeatInput", resolve),
//      content: JSON.stringify(dataObject),
//      contentType: "application/json"
//    });
//
//    log("HeartbeatInput REQUESTS");
//    log(JSON.stringify(dataObject,null,2));
//
//    if (options.phonehome) {
//      log("posting");
//      XMLReqTP.post();
//
//    } else {
//      log("phonehome, blocked by configuration");
//      resolve(XMLReqTP); /* return the request, won't have status */
//    }
//  };
//
//  // this becomes a promise.
//  dataObject = annotate(dataObject);
//
//  // or things like testpilot and such.
//  let addExtra = function (dataObject) {
//    if (options.extraData) {
//      dataObject.extra = extend({}, dataObject.extra || {}, options.extraData);
//    }
//    return dataObject;
//  };
//
//
//  // remember, validate strips extra fields silently!
//  let wrap_valid = (d) => {
//    try {
//      return (validate(d)); // may turn into a reject.
//    } catch (exc) {
//      log(exc);
//      reject(exc);
//    }
//  };
//
//  dataObject.then(
//  addExtra).then(
//  wrap_valid).then(
//  send).then(
//    null,
//    console.error);
//
//  return promise;
};




let phonehome = exports.phonehome = function(dataObject, options){
  dataObject = dataObject || {};
  options = extend({}, config, options);

  dataObject.is_test = !!options.testing;

  return new Promise(function(resolve, reject) {

    let send = function (dataObject) {
      /** TP packet
        * - special url
        * - POST instead of get
        * - explicit about content type.
        * - will autogen a record at /bagheera end
        */


      //function request(url, method, data, headers, contentType) {
      let Args = [
        options.url,
        "POST", // method,
        dataObject, // content  (will be stringified)
        {'Accept': 'application/json; indent=4'}, // headers
        "application/json" // contentType:
      ];

      if (options.phonehome) { // for real.
        log("posting");
        return request.request.apply(null, Args);
      } else {
        log("blocked by configuration");
        return Args; /* return the Args. */
      }
    };

    // or things like testpilot and such.
    let addExtra = function (dataObject) {
      if (options.extraData) {
        dataObject.extra = extend({}, dataObject.extra || {}, options.extraData);
      }
      return dataObject;
    };


    // remember, validate strips extra fields silently!
    // TODO, this should be promisy
    let wrap_valid = function (d)
    {
      return new Promise(function (resolve, reject){
        try {
          resolve(validate(d)); // may turn into a reject.
        } catch (exc) {
          log(exc);
          reject(exc);
        }
      });
    };

    /** main body. */

    // actually do the work.
    annotate(dataObject).then(
    addExtra).then(
    wrap_valid).then(
    send).then(
      resolve,
      reject);
  });
};
