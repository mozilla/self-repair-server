/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/. */

/*jshint forin:true, noarg:false, noempty:true, eqeqeq:true, bitwise:true,
  strict:true, undef:true, curly:false, browser:true,
  unused:true,
  indent:2, maxerr:50, devel:true, node:true, boss:true, white:true,
  globalstrict:true, nomen:false, newcap:true, esnext: false, moz: false  */

/*global */

"use strict";

// can't figure out where webpack lives, irritatingly
//var webpack = require("webpack");
//console.log(require.paths)
//var CommonsChunkPlugin = require("./lib/optimize/CommonsChunkPlugin");
//var commonsPlugin =
//  new CommonsChunkPlugin('common.js');

module.exports = {
  //context: __dirname + "/app",
  entry: {
        //index:  "./src/main.js",
        //after:  "./src/after"
  },
  output: {
      //path: __dirname + "/dist",
      //path: __dirname + "/repair/",
      //filename: "[name].packed.js"
  },
    module: {
        loaders: [
          { // << traceur
            test: /\.js$/,
            // have to traceur the tests too.
            exclude: /(node_modules|bower_components)\//,
            loader: 'traceur'
          },
          { test: /\.css$/, loader: "style!css" }
        ]
    },
};
