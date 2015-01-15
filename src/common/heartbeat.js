/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/. */

/*jshint forin:true, noarg:false, noempty:true, eqeqeq:true, bitwise:true,
  strict:true, undef:true, curly:false, browser:true,
  unused:true,
  indent:2, maxerr:50, devel:true, node:true, boss:true, white:true,
  globalstrict:true, nomen:false, newcap:true, esnext: true, moz: true  */

/*global require, exports, log */

"use strict";

// gross, installs Mozilla.UITour object
let UITour = require("thirdparty/uitour");  // for now.


let log = console.log.bind(console,"repair-logger:");


/*
  show heartbeat is complicated here :)
*/

//TODO find a uuid lib
function newId () {
  return "flow-" + Math.floor(Math.random() * 100000);
}

let showHeartbeat = function () {
  let flowid = newId();
  UITour.observe(function heartbeatCallback (aEventName, aData) {
    //
    // if startswith Heartbeat...
    //

    if (aEventName.indexOf("Heartbeat") === 0) {
      if (aData.flowid !== flowid) {
        log("not my heartbeat.  That's probably an error.", aData.flowid, "wanted", flowid);
        return;
      }
      let which = aEventName.split(":")[1];
      log(aEventName, flowid, aData);
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

  log("showing heartbeat");
  UITour.showHeartbeat(
    "Rate Firefox",  //
    flowid,             //
    "http://localhost/"
  )
}

module.exports.showHeartbeat = showHeartbeat;
