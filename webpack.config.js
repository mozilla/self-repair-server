/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/. */

/*jshint forin:true, noarg:false, noempty:true, eqeqeq:true, bitwise:true,
  strict:true, undef:true, curly:false, browser:true,
  unused:true,
  indent:2, maxerr:50, devel:true, node:true, boss:true, white:true,
  globalstrict:true, nomen:false, newcap:true, esnext: false, moz: false  */

/*global require, exports, log */

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
        index:  "./src/main.js",
        //after:  "./src/after"
	},
	output: {
	    //path: __dirname + "/dist",
	    path: __dirname + "/repair",
	    filename: "[name].js"
	},
    module: {
        loaders: [
            { test: /\.css$/, loader: "style!css" }
        ]
    },
    resolve : {
    	// relative to 'entry' above
        alias: {
            UITour: __dirname + "/thirdparty/uitour.js",
            jquery: "./thirdparty/jquery/jquery.js",
            actions:  __dirname + '/src/actions.js'
            //aplugin: "./aplugin/popper.js",
            //uistuff: "../../ui.js"
        }
    }
    // unclear how to get split to work, given 'no webpack' errors from cli
    //plugins: [
    //	commonsPlugin
    //  	//new webpack.optimize.CommonsChunkPlugin(/* chunkName= */"vendor", /* filename= */"vendor.bundle.js")
  	//]
};

/*
module.exports = {
  entry: './main.js',
  output: {
    filename: 'bundle.js'
  }
};

*/
