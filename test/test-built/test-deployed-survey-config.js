/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/. */

/*jshint forin:true, noarg:false, noempty:true, eqeqeq:true, bitwise:true,
  strict:true, undef:true, curly:false, browser:true,
  unused:true,
  indent:2, maxerr:50, devel:true, node:true, boss:true, white:true,
  globalstrict:true, nomen:false, newcap:true, esnext: true, moz: true,
  asi: true  */

/*global describe, it, require, exports, log */

"use strict";

/* this code mostly exists
   - for coverage sake
   - catch when new actions are added
*/
let { expect } = require("chai");
let rulesMod = require("../../src/common/rules");


let C = require("../../src/recipes/heartbeat-by-user-first-impression/config");
let U = require("../../src/recipes/heartbeat-by-user-first-impression/utils");


// idea... print out the survey audit?

let locales = ['en-us','en-uk', 'es-mx', 'zh-cn', 'de'];
let versions = ['46.0.1','47.0.1'];
let channels = ['aurora','release', 'beta', 'nightly']

function genProducts() {
  let out = [];
  for (let l of locales) {
    for (let c of channels) {
      out.push({
        //fxVersion: v,
        channel: c,
        locale: l
      })
    }
  }
  return out
}

/*
  [a,b],
  [c,d],
  [e,f]

  a c e
  a c f
  a d e
  a d f


  for k in _gen([c,d], [e,f]):
    _out.push([a] + k)


*/



let possibles = genProducts();

// for every possible combo, see which rule matches, and what urls there are!

function isRe (thing) {
  return Object.prototype.toString.call( thing ) == "[object RegExp]"
}

function regexReplacer (key, value) {
  if (isRe(value)) return '' + value;
  return value;
}

describe("Survey Rules Report", function () {
  var getEngagementUrl = U.getEngagementUrl;
  var rules = C.engagementRules.map((x)=>x.rule);
  let firstMatch = rulesMod.firstMatch;

  let results = [];
  for (let i=0; i < rules.length; i++) results[i] = [];

  for (let p of possibles) {
    let ans = firstMatch(p, rules);
    results[ans].push(p);
  }
  // display

  function formatUrls(conf) {
    return conf.urls.map((x,i)=>`   -  ${x} ${conf.breaks[i]*100}`).join("\n")
  }

  var blobs = results.map(function (r,i) {
    let header = `### Rule ${i}: "${C.engagementRules[i].alias}" (${C.engagementRules[i].urls.length} surveys) MATCHES ${r.length} profiles:
${formatUrls(C.engagementRules[i])}
`.trimRight()
    let body = '';
    if (r.length) {
      body = `${r.map((x)=>JSON.stringify(x)).join("\n")}`
    }
    return [header,body].join("\n\n").trimRight();
  })


  // actually print the template
  console.log(`

## Matched Rules

${blobs.join("\n\n")}

## ALL EXISTNG RULES

${JSON.stringify(C.engagementRules, regexReplacer, 2)}
`)

  it ("should report", ()=>expect(true).to.be.true());

})  // end of test.






