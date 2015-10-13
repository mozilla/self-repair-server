/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/. */

/*jshint forin:true, noarg:false, noempty:true, eqeqeq:true, bitwise:true,
  strict:true, undef:true, curly:false, browser:true,
  unused:true,
  indent:2, maxerr:50, devel:true, node:true, boss:true, white:true,
  globalstrict:true, nomen:false, newcap:true, esnext: true, moz: true,
  asi: true
  */

/*global describe, it, require, console, beforeEach, afterEach, before */


"use strict";


var Configer;


// config options <- f(profile)


// go until first match.

let C = new Configer();
configs.forEach((k,v) C.add(k,v));
C.add(aConfig, ans);
C.default(aConfig, ans);

var anAns = C.firstMatch(someConfig, responseOptions);


/* what logic is supported.

aConfig must be

  an object with these sorts of keys
  -  string: exact match *only*
  -  regex:  regex full test?

  NOT ALLOWED:
  - glob: NO, must use regex
  - number: NO, must use string  (ugh!)

  field is missing:  matches all.  Only present fields affect the match.

OR

  a function() that overrides this.


Footguns NOT prevented:
- rules aren't in most restrictive order?  (too bad)

*/
