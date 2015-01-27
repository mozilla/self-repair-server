/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/. */

/*jshint forin:true, noarg:false, noempty:true, eqeqeq:true, bitwise:true,
  strict:true, undef:true, curly:false, browser:true,
  unused:true,
  indent:2, maxerr:50, devel:true, node:true, boss:true, white:true,
  globalstrict:true, nomen:false, newcap:true, esnext: true, moz: true  */

/*global exports */

"use strict";

let sdkobj = require("./object");
let merge  = sdkobj.merge;

let FlowBase = function () {
  return  {
    // COMPARED TO upload-validate, for ref.

    //"person_id": vstring('person_id', false), // "c1dd81f2-6ece-11e4-8a01-843a4bc832e4",
    "survey_id": "", // vstring('survey_id', false), //"lunch",
    "flow_id": "", //vstring('flow_id', false), // "20141117_attempt1",
    "question_id": "", //"howwaslunch",
    "response_version": 1, // 1
    //"updated_ts": vTimestamp('updated_ts', false),  // 1416011156000,
    "question_text": "", // vstring('question_text', false),  //"how was lunch?",
    "variation_id": "",  //vstring('variation_id', false),  // "1",

    // fields for this study...
    "score": null, //vScore("score"),  // null,
    "max_score": null, //vScore("max_score"),   //
    "flow_began_ts": 0, //vTimestamp("flow_began_ts"),  //
    "flow_offered_ts": 0, // vTimestamp("flow_offered_ts"),  //
    "flow_voted_ts": 0, //vTimestamp("flow_voted_ts"),   //
    "flow_engaged_ts": 0, //vTimestamp("flow_engaged_ts"),  //
    //// system
    //"platform": //"" vstring('platform', false),        //
    //"channel": // vstring('channel', false),         //
    //"version": //vstring('version', false),          //
    //"locale": // vstring('locale', false),           //
    //"build_id": //vstring('build_id', false),         //
    //"partner_id": //vstring('partner_id', false),       //
    //"profile_age": //vNumber('profile_age'),    //
    //"profile_usage": //vJsonableObject("profile_usage"),    //
    //"addons": // vArray("addons"),           //
    //"extra": // vJsonableObject("extra"),
    //// is this real?
    //"is_test": vboolean('is_test') //true

    "flow_links": []  // array of (ts, id)
  };
};

let _current;

// a bit gruesome.  Avoiding writing a full state depedency checker
let phases = {
  "began": [],
  "offered": ['began'],
  "voted": ['began', 'offered', ],
  "engaged": ['began', 'offered', 'voted']
};

// order of phases.
let provePhaseReady = function (data, phase) {
  let reqs = phases[phase];
  reqs.forEach(function(k) {
    let key = "flow_" + k + "_ts";
    if (data[key] <= 0) {
      throw phase + " requires " + k;
    }
  });
};


var Flow = function (updateProps) {
  this.data = new FlowBase();
  merge(this.data, updateProps);

  let obj = {
    data: this.data,
    link: function (action, whichpage) {
      console.log("linking at flow!");
      this.data.flow_links.push([Date.now(), action, whichpage]);
      return this;
    },
    rate: function (n) {
      console.log('rating', n);
      this.data.score = n;
      return this;
    }
  };

  // only accept 'first set' for these.
  ["began", "offered", "voted", "engaged"].forEach(function (k) {
    obj[k] = (function (ts) {
      console.log(this);
      provePhaseReady(this.data, k); //
      let key = "flow_" + k + "_ts";
      console.log("flow", k, key, key in this.data, this.data);
      let d = this.data;
      if (key in d) {
        if (d[key] === 0) {
          d[key] = ts || Date.now();
        }
      } else {
        console.log('oh no!');
        throw (new Error("Bad key in current flow: " + key));
      }
    }).bind(obj);
  });
  return obj;
};



/*
// future work: ensure that flows are 'forward only'
let flow = {
  questiontext: aMessage,
  engagementurl: aEngagementURL,
  rating: 0,
  flowid: aFlowId,
  stages: {
    offered: 0,
    voted: 0,
    closed: 0
  }
};

*/

exports.Flow = Flow;

