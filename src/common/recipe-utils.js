/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/. */

/*jshint forin:true, noarg:false, noempty:true, eqeqeq:true, bitwise:true,
  strict:true, undef:true, curly:false, browser:true,
  unused:true, indent:2, maxerr:50, devel:true, node:true, boss:true, white:true,
  globalstrict:true, nomen:false, newcap:true, esnext: true, moz: true,
  asi: true  */

/*global module */

"use strict";

/** Wrap localstore a bit.
  *
  *  usage:
  *
  *    var state = new Lstore("aLocalStoreKey");
  *    state.data   // mostly a normal-ish obj
  *    state.store()
  *    state.revive()
  *
  **/
var Lstore = function (key, storage) {
  if ( !(this instanceof Lstore) )
    return new Lstore(key, storage);

  // to do, proper object chain?
  this.key = key;
  this.data = {};
  storage = storage || localStorage;

  this.store = function () {
    storage[this.key] = JSON.stringify(this.data);
    return this;
  };
  this.revive = function () {
    this.data = JSON.parse(storage[this.key] || "{}");
    this.store();
    return this;
  };
  this.clear = function () {
    this.data={};
    this.store();
    return this;
  };
  this.revive().store(); // always comes started
  return Object.preventExtensions(this); // freezing would break clear/revive
};

module.exports = {
  Lstore: Lstore,
};

