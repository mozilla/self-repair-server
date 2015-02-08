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

var dispatchEvent = function(onto, message, data, bubbles, cancelable) {
  if (bubbles===undefined) bubbles = true;
  if (cancelable===undefined) cancelable = true;
  if (data === undefined) data = {};

  var event = new CustomEvent(
    message,
    {
      detail: data,
      bubbles: bubbles,
      cancelable: cancelable
    }
  );
  onto.dispatchEvent(event);
};

/* 3 part style.  like that of UI tour */
var message = function (namespace, aEventName, aData, options) {
  options = options || {};
  var bubbles = options.bubbles !== undefined ? options.bubbles : true;
  var cancelable = options.cancelable !== undefined ? options.cancelable : true;
  var onto = options.onto || document;

  dispatchEvent(
    onto,
    namespace,
    { event: aEventName,
      params: aData  // "params" in uitour
    },
    bubbles,
    cancelable
    );
};

// modelled after uitour
var observe = function(namespace, callback, options) {
  options = options || {};
  var onto = options.onto || document;
  var newFn = function (event) {
    var detail = event.detail || {};
    callback(detail.event, detail.params);
  };
  onto.addEventListener(namespace, newFn);
  return [onto, namespace, newFn]; // allows removal by unobserve
};


// takes results of an observe and kills it.
var unobserve = function(observeResult) {
  var onto = observeResult[0];
  var namespace = observeResult[1];
  var fn = observeResult[2];
  onto.removeEventListener(namespace, fn);
  return observeResult;
};


exports.dispatchEvent = dispatchEvent;
exports.message = message;
exports.observe = observe;
exports.unobserve = unobserve;
