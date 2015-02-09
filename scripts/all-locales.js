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

'use strict';

var fs = require('fs');
var path = require('path');



var mkdirSync = function (path) {
  try {
    fs.mkdirSync(path);
  } catch(e) {
    if ( e.code != 'EEXIST' ) throw e;
  }
}


var LANGS = [
    'ach', 'af', 'ak', 'an', 'ar', 'as', 'ast', 'az', 'be', 'bg',
    'bn-BD', 'bn-IN', 'br', 'bs', 'ca', 'cs', 'csb', 'cy', 'da',
    'de', 'dsb', 'el', 'en-GB', 'en-US', 'en-ZA', 'eo', 'es-AR', 'es-CL',
    'es-ES', 'es-MX', 'et', 'eu', 'fa', 'ff', 'fi', 'fr', 'fy-NL',
    'ga-IE', 'gd', 'gl', 'gu-IN', 'he', 'hi-IN', 'hr', 'hu', 'hy-AM',
    'hsb', 'id', 'is', 'it', 'ja', 'ja-JP-mac', 'ka', 'kk', 'km', 'kn',
    'ko', 'ku', 'lg', 'lij', 'lt', 'lv', 'mai', 'mk', 'ml', 'mn',
    'mr', 'ms', 'my', 'nb-NO', 'nl', 'nn-NO', 'nso', 'oc', 'or', 'pa-IN',
    'pl', 'pt-BR', 'pt-PT', 'rm', 'ro', 'ru', 'sah', 'si', 'sk', 'sl',
    'son', 'sq', 'sr', 'sv-SE', 'sw', 'ta', 'ta-LK', 'te', 'th', 'tr',
    'uk', 'ur', 'vi', 'wo', 'xh', 'zh-CN', 'zh-TW', 'zu',
];

// RTL languages.
var RTL_LANGS = ['ar', 'fa', 'he', 'ur'];


var nothingBurger = function (lang) {
  var dir = path.join('repair', lang);
  var file = path.join(dir,"index.html");
  mkdirSync(dir);
  if (!fs.existsSync(file)) {
    fs.open(file, 'w'); // creates it
  }
}


// do t!
LANGS.forEach(nothingBurger);
RTL_LANGS.forEach(nothingBurger);


