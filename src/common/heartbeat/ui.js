/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/. */

/*jshint forin:true, noarg:false, noempty:true, eqeqeq:true, bitwise:true,
  strict:true, undef:true, curly:false, browser:true,
  unused:true,
  indent:2, maxerr:50, devel:true, node:true, boss:true, white:true,
  globalstrict:true, nomen:false, newcap:true, esnext: true, moz: true  */

/*global require, console */

"use strict";

let UITour = require("thirdparty/uitour");  // for now.
let type = require("../../jetpack/type");
let log = console.log.bind(console,"repair-logger:");

// mapping of flowid: callback
let _callbacks = {};

/** Callback that catches ALL heartbeat callbacks.
  *
  * (Warning, UITour.observe can only have 1 listener.
  * For now, it's this one.  see issues #110)
  */
function heartbeatsCallback (aEventName, aData) {
  //log("maybe", aEventName, flowid, aData); // all tour events
  if (aEventName.indexOf("Heartbeat") === 0) {
    let flowId = aData.flowId;
    if (!(flowId in _callbacks)) {
      return;
      // TODO... what exactly?  how weird is this?
    }
    let callback = _callbacks[flowId];
    if (callback && type.isFunction(callback)) {
      callback(flowId, aEventName, aData);
    }
  }
}

UITour.observe(heartbeatsCallback);


/** make a '5 stars heartbeat tracking object for client-side code
  *
  *  flowid:  string, should be uuid like, but not required
  *  message: the text to show to the user
  *  engagementUrl:
  *    url to open with query args after vote.
  *    if null, then 'voting' will do nothing.
  *  learnMoreMsg: text for the 'learn more',
  *  learnMoreUrl: url that 'Learn more' links to,
  *  callback:  to run on 'state change'.
  *    takes callback(flowid, aEventName, aData);
  *    aData:
  *      - flowid: an id
  *
  *
  *  return BoundHeartbeat
  *  - flow: state
  **/
let showHeartbeat = function (flowid, message, thanksMsg, engagementUrl, learnMoreMsg, learnMoreUrl,  callback, extraTelemetryArgs={}) {
  callback = type.isFunction(callback) ? callback : null;

  _callbacks[flowid] = callback;  // this registers it.

  UITour.showHeartbeat(
    message,  //
    thanksMsg,
    flowid,             //
    engagementUrl,
    learnMoreMsg,
    learnMoreUrl,
    extraTelemetryArgs
  );

  return {flowid: flowid};
};

module.exports.showHeartbeat = showHeartbeat;
