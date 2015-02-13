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
let type = require("../jetpack/type");
let log = console.log.bind(console,"repair-logger:");

//log(Object.keys(UITour))

/*
  show heartbeat is complicated here :)
*/


/* make a '5 stars heartbeat tracking object for client-side code
  flowid:  string, should be uuid like, but not required
  message: the text to show to the user
  engagementUrl:
    url to open with query args after vote.
    if null, then 'voting' will do nothing.
  callback:  to run on 'state change'.
    takes callback(flowid, aEventName, aData);
    aData:
      - flowid: an id


  return BoundHeartbeat
  - flow: state
*/
let showHeartbeat = function (flowid, message, thanksMsg, engagementUrl, callback) {
  callback = type.isFunction(callback) ? callback : null;

  // catch all the messages related to all heartbeat star widgets
  UITour.observe(function heartbeatCallback (aEventName, aData) {
    //log("maybe", aEventName, flowid, aData); // all tour events
    if (aEventName.indexOf("Heartbeat") === 0) {
      if (aData.flowId !== flowid) {
        //log("not my heartbeat.  That's probably an error.", aData.flowId, "wanted", flowid);
        return;
      }
      //log(aEventName, flowid, aData);
      if (callback && type.isFunction(callback)) {
        callback(flowid, aEventName, aData);
      }
    }
    /*
    switch (aEventName) {
      case "Heartbeat:NotificationOffered": {
        info("'Heartbeat:Offered' notification received (timestamp " + aData.timestamp.toString() + ").");
        // The UI was just shown. We can simulate a click on a rating element (i.e., "star").
        simulateVote(flowId, 2);
        break;
      }
      case "Heartbeat:Voted": {
        info("'Heartbeat:Voted' notification received (timestamp " + aData.timestamp.toString() + ").");
        break;
      }
      case "Heartbeat:NotificationClosed": {
        info("'Heartbeat:NotificationClosed' notification received (timestamp " + aData.timestamp.toString() + ").");
        is(gBrowser.tabs.length, originalTabCount, "No engagement tab should be opened.");

        // |done()| needs to be called here and not in "voted" otherwise the messageManager
        // will throw a NOT_INITIALIZED error.
        done();
        break;
      }
      default:
        // We are not expecting other states for this test.
        ok(false, "Unexpected notification received: " + aEventName);
    }
    */
  });

  UITour.showHeartbeat(
    message,  //
    thanksMsg,
    flowid,             //
    engagementUrl
  );

  return {flowid: flowid};
};

module.exports.showHeartbeat = showHeartbeat;


// should there be other common heartbeat things here?
