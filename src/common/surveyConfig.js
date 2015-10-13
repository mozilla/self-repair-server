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
C.add(aMatch, ans);
C.default(aMatch, ans);

var anAns = C.firstMatch(someConfig, responseOptions);


/* what logic is supported.

aMatch must be

  an object with these sorts of keys
  -  string: exact match *only*
  -  regex:  regex full test?
  -  function:  boolean (value, keyname)

  NOT ALLOWED:
  - glob: NO, must use regex
  - number: NO, must use string  (ugh!)

  field is missing:  matches all.  Only present fields affect the match.

OR

  a function() that overrides this.


aMatch may have this SPECIAL extra key.

- .special  => an a extra function that returns boolean.

Footguns NOT prevented:
- rules aren't in most restrictive order?  (too bad)
- validate rules?

FAQ:
- a key in aMatch, but not in userConfig?  ===>  ???
- a null/missing in userConfig ==> ???   implies an orEmpty function


More realistic example:

user:
- fxversion 41.0.1a
- channel: release-ccb3  // funnel cake
- geo:  UNKNOWN (or us or such)
- locale: 'es-ES'


a set of configs

[
  { version: /41/,
    channel: /release/,
    geo: 'de'
  },    // returns the german 41 survey choices
  { version: function (v, k) => int(v.split('.')[0]) >= 43,  // not js, but whatever
    locale: 'en-us'
  },    // returns the en-us 43+

]



*/
