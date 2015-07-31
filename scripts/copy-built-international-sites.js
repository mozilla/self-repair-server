#!/bin/env/node

/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/. */

/*jshint forin:true, noarg:false, noempty:true, eqeqeq:true, bitwise:true,
  strict:true, undef:true, curly:false, browser:true,
  unused:true,
  indent:2, maxerr:50, devel:true, node:true, boss:true, white:true,
  globalstrict:true, nomen:false, newcap:true, esnext: false, moz: false,
  asi: true  */

/*global require */

// this could maybe be replace by a gulp task, or part of webpack?

'use strict';

var fs = require('fs');
var path = require('path');

// 3rd party
var inline = require('inline-source');
require('shelljs/global');

// US base case.
console.log("inline and deploy en-US as base")
var htmlpath = path.resolve('deploy/en-US/repair/index.html');
cp('-f', "scripts/locale_base/index.html", htmlpath);
var html = inline.sync(htmlpath, {
  compress: true,
  rootpath: path.resolve('deploy/en-US/repair/'),
  // Skip all css types and png formats
  //ignore: ['css', 'png']
});
fs.writeFileSync(htmlpath, html);

// known working locales.

"fr de en-GB".split(/\s+/).forEach(function (locale) {
  console.log("copying site: en-US =>", locale);
  var D = "deploy/" + locale
  rm('-rf', D);
  cp('-r', "deploy/en-US/*", D)
});


