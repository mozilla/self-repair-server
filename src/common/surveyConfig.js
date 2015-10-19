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

let _ = require("lodash");

var Configer;

// config options <- f(profile)


// go until first match.

let C = new Configer();
configs.forEach((k,v) C.add(k,v));
C.add(aMatch, ans);  // is this needful?  Why only 'add'?  Why not just take the list?
C.default(aMatch, ans);

var anAns = C.firstMatch(someConfig, responseOptions);

let firstMatch = function (aConfig, rulesArray, defaultAns, options={}) {
  // have the rules
  //
}


let NullPasses = function (thing) {
  if (thing == undefined || thing == null) {
    return true;
}

let Exact = (string) => {
  return (proposed) => proposed === string;
}

let StartsWith = (string) => {
  return (proposed) => proposed.indexOf(string) == 0;
};


// NOTE: I hate everything
Configer = function (matchRulesArray) {
  this.matchRules = matchRulesArray
}
Configer.prototype = {
  firstMatch: function (aConfig, aDefault=this.default) {
  }
}

// this makes me hate my life.
let whichType = function (thing) {
  // array, string, nully, object, function regex
  if (_.isFunction(thing)) return "function";
  if (_.isRegExp(thing)) return "regexp";
  if (_.isString(thing)) return "string";
  if (_.isArrary(thing)) return "array";
  if (_.isNull(thing)) return "null";
  if (_.isUndefined(thing)) return "undefined";
  if (_.isObject(thing)) return "object";  // torward end
  else return "something";

}

let firstMatch = function (data, spec) {
  // better.... return all(genHandler(x) of spec.)

  let handle = function (key) {
    if (key == ".special") {
      return (val) => spec['.special'](thing)
    }  // run on whole
    else {
      let val = thing[key];
      let clause = spec[key];

      if (val == null || val == undefined) return true;

      switch (whichType(clause)) {
        case "regexp":
          return clause.test(data)
        case "string":
          return clause
        case "function":
        case "array":
          return () => true;
        default:
          return () => true;
      }
    }
  }

  for (let speckey of spec) {
    if (!p.hasOwnProperty(speckey)) {
      continue
    }
    let val = data[speckey];
    if (val == null || val == undefined) continue  // is this right?

    if (!handle(speckey, val)) return false // false if any false.
  }
  return true;
}

/* what logic is supported.

aMatch must be

  an object with these sorts of keys
  -  string: exact match *only*
  -  regex:  regex full test?
  -  function:  boolean (value, keyname)
  -  array:  OneOf  ??

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


Alternative Idea from willkg.

I think you should abstract this a level and have values be matcher functions/objects. So then you'd specify this as:

{
    version: StartswithMatch('41'),
    channel: ExactMatch('release'),
    geo: ExactMatch('de'),
}

Then you have a bunch of matchers like:

ExactMatch(string) -- exact string match on a given string
StartswithMatch(string) -- startswith match on a given string
RegexMatch(regex) -- matches a given regex
OrMatch(array of strings or matchers) -- if one of these matches, then this returns True
AndMatch(array of strings or matchers) -- if all of these match, then this returns True
NotMatch(matcher) -- inverts the match

Is that a rich enough grammar to express the things you need to express? Is it readable so as to reduce errors?

Maybe instead of this, you just have a tree of them?

{
    title: 'Recipe for disaster',
    matcher: AndMatch([
        StartswithMatch('version', '41'),
        ExactMatch('channel', 'release'),
        ExactMatch('geo', 'de'
    ])
}

I did classes here, but we could do functions like startswithM and andM or something like that. Whatever.


*/



/*
Worked example:

*/

let example = {
  ans: {
    alias:  'mix of things',
    restdays: 30,
    sample: 1 / thousand,  // 1 of 1000
    engagementURL:  function (userConfig, rng) {    //
      "some://url"
    }
  },

  match: {
    channel: /nightly/,
    locale:  OneOf(['en-US', 'fr', 'en-GB', 'de']),
  }
}




//
//



