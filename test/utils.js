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

exports.uuid = require('uuid');



function isRe (thing) {
  return Object.prototype.toString.call( thing ) == "[object RegExp]"
}

function regexReplacer (key, value) {
  if (isRe(value)) return '' + value;
  return value;
}


// rule sorting
function _normalizeRule(r) {
  let out = {};
  for (let x in r) {out[x] = r[x].toString()}
  return out;
}

/*
  _ruleInRule({a:1},{a:1,b:2})  T
  _ruleInRule({a:1},{a:2,b:2})  F
  _ruleInRule({a:1,c:1},{a:1,b:2})  F
  _ruleInRule({a:1,c:1},{a:1,b:2, c:1}) T
*/
function _ruleInRule(r1, r2) {
  return Object.keys(r1).map((k)=>r2[k] == r1[k]).every(Boolean);
  // O: |r1| * |r2|
  // for part in r1;
  //   is r1 in r2?
  //
  // return false
}

function _rulesSorted(rules) {
  // this is a O(|array|)^2, hopefully not that gross for most things
  for (let ii = 1;  ii < rules.length; ii++) {   // start a 1
    for (let jj = 0; jj < ii; jj ++) {           // 0 to ii - 1
        if (_ruleInRule(rules[ii], rules[jj])) {
          throw new Error(`wrong order ${JSON.stringify(rules[ii])}, ${JSON.stringify(rules[jj])}`);
        }
    }
  }
  return true
}

function isConfigSorted(rulesOriginal) {
  // we want restrictive first, so reverse the list.
  // on the normalized rules
  return _rulesSorted(rulesOriginal.reverse().map((x)=>_normalizeRule(x.rule)))
}


exports.isRe = isRe;
exports.regexReplacer = regexReplacer;
exports.isConfigSorted = isConfigSorted;
