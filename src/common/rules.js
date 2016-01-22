/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/. */

/*jshint forin:true, noarg:false, noempty:true, eqeqeq:true, bitwise:true,
  strict:true, undef:true, curly:false, browser:true,
  unused:true, indent:2, maxerr:50, devel:true, node:true, boss:true, white:true,
  globalstrict:true, nomen:false, newcap:true, esnext: true, moz: true,
  asi: true  */

/*global module */

function isRe (thing) {
  return Object.prototype.toString.call( thing ) == "[object RegExp]"
}

function matchRulePart(subObj, expected) {
  if (isRe(expected)) {
    return expected.test(subObj)
  } else {
    return subObj == expected  // strings, numbers.
  }
}

function match(obj, rule) {
  for (let k in rule) {
    if (! matchRulePart(obj[k], rule[k])) return false
  }
  return true
}

function firstMatch (obj, rules) {
  for (let ii=0; ii < rules.length; ii++) {
    if (match(obj, rules[ii])) return ii
  }
}

module.exports = {
  firstMatch: firstMatch,
  match: match,
  matchRulePart: matchRulePart
}
