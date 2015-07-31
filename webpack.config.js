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

var webpack = require("webpack");

var TRAVIS = !! process.env.TRAVIS;

module.exports = {
	//context: __dirname + "/app",
	entry: {
        index:  "./src/main.js",
        //after:  "./src/after"
	},
	output: {
	    path: __dirname + "/deploy/en-US/repair",
	    filename: "[name].js"  // will be inlined.
	},
    module: {
        loaders: [
          { // << babel-loader
            test: /\.js$/,
            // have to babel-loader the tests too.
            exclude: /(node_modules|bower_components)\//,
            loader: 'babel-loader',
            query: {  // options
              comments: !TRAVIS
            }
          },
          { test: /\.css$/, loader: "style!css" },
          { test: /\.json$/, loader: "json"}
        ]
    },
    resolve : {
      // relative to 'entry' above
      // aliases are bad b/c other require systems don't use the same ones.
      /*alias: {
          UITour: __dirname + "/thirdparty/uitour.js",
      }*/
    },
    // unclear how to get split to work, given 'no webpack' errors from cli
    plugins: [
      TRAVIS && new webpack.optimize.UglifyJsPlugin(),
      new webpack.optimize.DedupePlugin(),
      //new CommonsChunkPlugin('common.js')
      //	commonsPlugin
      //  	//new webpack.optimize.CommonsChunkPlugin(/* chunkName= */"vendor", /* filename= */"vendor.bundle.js")
  	].filter(Boolean)
};

