/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/. */

/*jshint forin:true, noarg:false, noempty:true, eqeqeq:true, bitwise:true,
  strict:true, undef:true, curly:false, browser:true,
  unused:true, indent:2, maxerr:50, devel:true, node:true, boss:true, white:true,
  globalstrict:true, nomen:false, newcap:true, esnext: true, moz: true,
  asi: true
*/

/*global exports */

"use strict";

//end url with ?<somejson>
function paramsToObj(search) {
  if (!search) return {};
  search = search.startsWith("?") ? search.substring(1) : search;
  search = search.endsWith("/") ? search.substring(0,search.length-1): search;
  search = decodeURIComponent(search);
  try {
    return JSON.parse(search);
  } catch (e) {
    console.error("paramToObj: bad params:", decodeURIComponent(search));
  }
}

function guessLocale (path, aNav) {
  // this should have tests!
  // ['en-US', 'en-us', 'en',] => good.
  // ['en-', '12-34', 'ben-us'] => bad
  // frankly, maybe  I should pass these in as a var.
  // this fails for 'upper sorbian' => 'hsb'
  path = path || window.location.pathname;
  let nav = aNav || navigator || {};
  let ans;
  let re = (x) => /^[a-z]{2,3}(|\-[a-z]{2})$/i.test(x);
  let possibles = path.split("/").filter(re);
  if (possibles.length) {
    ans = possibles.pop();
  } else {
    ans = (nav && nav.language);
  }
  return ans;
}


exports.paramsToObj = paramsToObj;
exports.guessLocale = guessLocale;


