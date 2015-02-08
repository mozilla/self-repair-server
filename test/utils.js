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

// add 'todo' tests, per https://github.com/mochajs/mocha/issues/1510
exports.shimTodo = function (itFn) {
  itFn.todo = function (title, callback) {
    return itFn.skip("TODO: " + title, callback);
  };
};

exports.uuid = require('node-uuid');
