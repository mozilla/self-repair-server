/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;
/******/
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	/* This Source Code Form is subject to the terms of the Mozilla Public
	 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
	 * You can obtain one at http://mozilla.org/MPL/2.0/. */

	/*jshint forin:true, noarg:false, noempty:true, eqeqeq:true, bitwise:true,
	  strict:true, undef:true, curly:false, browser:true,
	  unused:true,
	  indent:2, maxerr:50, devel:true, node:true, boss:true, white:true,
	  globalstrict:true, nomen:false, newcap:true, esnext: true, moz: true  */

	/*global require, console */

	/**!
	  About this module:

	  Main loop

	  This is is the output target for webpack
	*/


	/**
	  potential problems:
	  - state actually isn't constant over run.  should we fix that. TODO.
	  -

	  Should be doing something smart to check lots of deps in one go?
	  Maybe wait until addons list to get smarter about this?
	  Or only run a subset of these recipes for each person each day?

	  Do all recipe names need to be unique?  If so, why don't I define an obj instead of a list.


	TODO?  Promises or callback as first arg?  Are we node?

	*/


	"use strict";

	console.log(
	  "Welcome to heart heart heart beat."
	);

	let runner = __webpack_require__(1);
	let actions = __webpack_require__(2);
	let getState = __webpack_require__(3);

	// is there a timer here? I dunno!
	let mainloop = function (repairsList) {
	  getState().then(
	  function (state) {
	    actions.log("about to runAll");
	    runner.runAll(repairsList, state,
	    function () { actions.log("runAll callback"); }
	   );
	  });
	};

	// actually run
	// is there where 'repairs dev' would be called by env?

	let repairs;
	if (__DEV__) {
	  actions.log('using dev repairs list');
	  repairs = __webpack_require__(4);
	} else {
	  repairs = __webpack_require__(5);
	}

	mainloop(repairs);

	// for use in testing, debugging
	window.repairs = repairs;
	window.actions = actions;

	// loop over the list?
	// do them all?
	// sync or async?
	// ye gods it is Test Pilot *AND* telemetry experiment all over again.
	// is this reinventing the darn wheel?


	/*



	*/


/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	/* This Source Code Form is subject to the terms of the Mozilla Public
	 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
	 * You can obtain one at http://mozilla.org/MPL/2.0/. */

	/*jshint forin:true, noarg:false, noempty:true, eqeqeq:true, bitwise:true,
	  strict:true, undef:true, curly:false, browser:true,
	  unused:true,
	  indent:2, maxerr:50, devel:true, node:true, boss:true, white:true,
	  globalstrict:true, nomen:false, newcap:true, esnext: true, moz: true  */

	/*global require, console */

	/**!
	  About this module:

	  Runner
	  repair list // Should move?

	  This is is the output target for webpack
	*/


	/**
	  potential problems:
	  - state actually isn't constant over run.  should we fix that. TODO.
	  -

	  Should be doing something smart to check lots of deps in one go?
	  Maybe wait until addons list to get smarter about this?
	  Or only run a subset of these recipes for each person each day?

	  Do all recipe names need to be unique?  If so, why don't I define an obj instead of a list.


	TODO?  Promises or callback as first arg?  Are we node?

	*/


	"use strict";

	console.log(
	  "Welcome to heart heart heart beat."
	);

	let actions = __webpack_require__(2);
	let utils = __webpack_require__(6);

	// TODO, write this, decide of return val (throw? false?  list of errors?)
	// TODO, use an existing validation system?
	// TODO, record and describe failures
	let validateConfig = function (config) {
	  return (
	    (config.name !== undefined) &&
	    (config.description !== undefined) &&
	    (config.recipe !== undefined) &&
	    (config.shouldRun !== undefined)
	  );
	  // has keys
	  // these are callables
	  //
	}; //


	// right now NO
	// - fancy error handling
	// - stoppability
	// - retry

	let attemptRun = function (recipe, state) {
	  if (! validateConfig(recipe))  throw new Error("invalid config");
	  if (recipe.shouldRun(state)) {
	    actions.log("will run", recipe);
	    recipe.recipe(state).then(
	      function () {actions.log(recipe.name);},
	      function () {actions.error(recipe.name);}
	    );  // yeah, not sure what all the effects here should be
	  } else {
	    actions.log("will not run");
	  }
	};

	// should this call back with some sort of progress / success obj?
	// like which ran, and their statuses?
	let runAll = exports.runAll = function (repairs, state, cb) {
	  let l = repairs.length;
	  actions.log(l);
	  for (let ii=0; ii < l; ii++) {
	    // note state gets changed by repairs, by definition
	    let repair = repairs[ii];
	    actions.log("attempting", repair.name);
	      attemptRun(repair, state);
	  }
	  cb(true);
	};




/***/ },
/* 2 */
/***/ function(module, exports, __webpack_require__) {

	/* This Source Code Form is subject to the terms of the Mozilla Public
	 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
	 * You can obtain one at http://mozilla.org/MPL/2.0/. */

	/*jshint forin:true, noarg:false, noempty:true, eqeqeq:true, bitwise:true,
	  strict:true, undef:true, curly:false, browser:true,
	  unused:true,
	  indent:2, maxerr:50, devel:true, node:true, boss:true, white:true,
	  globalstrict:true, nomen:false, newcap:true, esnext: true, moz: true  */

	/*global require, exports, log */

	"use strict";

	let UITour = __webpack_require__(7);  // defined as a third party

	let log = console.log.bind(console,"repair-logger:");
	let error = console.error.bind(console,"repair-logger:");

	let actions = {
	  showHeartbeat:  log("showing heartbeat"), // UITour.showHeartbeat,
	  // others?  phone home?  record telemetry?  see bug!
	  //   uninstall addon
	  //   change some subset of hidden prefs?
	  //
	  log: log,
	  error: error
	};

	module.exports = actions;


/***/ },
/* 3 */
/***/ function(module, exports, __webpack_require__) {

	/* This Source Code Form is subject to the terms of the Mozilla Public
	 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
	 * You can obtain one at http://mozilla.org/MPL/2.0/. */

	/*jshint forin:true, noarg:false, noempty:true, eqeqeq:true, bitwise:true,
	  strict:true, undef:true, curly:false, browser:true,
	  unused:true,
	  indent:2, maxerr:50, devel:true, node:true, boss:true, white:true,
	  globalstrict:true, nomen:false, newcap:true, esnext: true, moz: true  */

	/*global require, exports, log */

	"use strict";

	// should this be gotten every time?  This is async, right?
	let state;

	// should this promise?  GRL likes promises
	let getState = exports.getState = function () {
	  // set by side effect, yuck
	  state = {addons: [], os: 'yep', homepage: "jerryjerryjerry.net"};  // set by side effect?  really?
	  return new Promise(function(r){r(state)});
	};





/***/ },
/* 4 */
/***/ function(module, exports, __webpack_require__) {

	/* This Source Code Form is subject to the terms of the Mozilla Public
	 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
	 * You can obtain one at http://mozilla.org/MPL/2.0/. */

	/*jshint forin:true, noarg:false, noempty:true, eqeqeq:true, bitwise:true,
	  strict:true, undef:true, curly:false, browser:true,
	  unused:true,
	  indent:2, maxerr:50, devel:true, node:true, boss:true, white:true,
	  globalstrict:true, nomen:false, newcap:true, esnext: true, moz: true  */

	/*global require, exports, log */

	"use strict";

	let repairList = module.exports = [
	  {
	    name: "fake dev repair",
	    shouldRun: function () {true},
	    recipe: function () {true}
	  }
	];


/***/ },
/* 5 */
/***/ function(module, exports, __webpack_require__) {

	/* This Source Code Form is subject to the terms of the Mozilla Public
	 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
	 * You can obtain one at http://mozilla.org/MPL/2.0/. */

	/*jshint forin:true, noarg:false, noempty:true, eqeqeq:true, bitwise:true,
	  strict:true, undef:true, curly:false, browser:true,
	  unused:true,
	  indent:2, maxerr:50, devel:true, node:true, boss:true, white:true,
	  globalstrict:true, nomen:false, newcap:true, esnext: true, moz: true  */

	/*global require, exports, log */

	"use strict";

	let repairList = module.exports = [
	  __webpack_require__(8),
	  __webpack_require__(9)
	];


/***/ },
/* 6 */
/***/ function(module, exports, __webpack_require__) {

	/* This Source Code Form is subject to the terms of the Mozilla Public
	 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
	 * You can obtain one at http://mozilla.org/MPL/2.0/. */

	/*jshint forin:true, noarg:false, noempty:true, eqeqeq:true, bitwise:true,
	  strict:true, undef:true, curly:false, browser:true,
	  unused:true,
	  indent:2, maxerr:50, devel:true, node:true, boss:true, white:true,
	  globalstrict:true, nomen:false, newcap:true, esnext: true, moz: true  */

	/*global require, exports, log */

	"use strict";

	/**
	  * promise a synchronous or async value.  Useful for starting promise chains
	  */
	let resolve = exports.resolve = function (value) {
	  return new Promise(function (resolve, reject) {resolve(value)});
	};

	let reject = exports.reject = function (value) {
	  return new Promise(function (resolve, reject) {reject(value)});
	};

	// sdk promised
	var promised = exports.promised = (function() {
	  // Note: Define shortcuts and utility functions here in order to avoid
	  // slower property accesses and unnecessary closure creations on each
	  // call of this popular function.

	  var call = Function.call;
	  var concat = Array.prototype.concat;

	  // Utility function that does following:
	  // execute([ f, self, args...]) => f.apply(self, args)
	  function execute(args) { return call.apply(call, args) }

	  // Utility function that takes promise of `a` array and maybe promise `b`
	  // as arguments and returns promise for `a.concat(b)`.
	  function promisedConcat(promises, unknown) {
	    return promises.then(function(values) {
	      return resolve(unknown).then(function(value) {
	        return values.concat([ value ]);
	      });
	    });
	  }

	  return function promised(f, prototype) {
	    /**
	    Returns a wrapped `f`, which when called returns a promise that resolves to
	    `f(...)` passing all the given arguments to it, which by the way may be
	    promises. Optionally second `prototype` argument may be provided to be used
	    a prototype for a returned promise.

	    ## Example

	    var promise = promised(Array)(1, promise(2), promise(3))
	    promise.then(console.log) // => [ 1, 2, 3 ]
	    **/

	    return function promised() {
	      // create array of [ f, this, args... ]
	      return concat.apply([ f, this ], arguments).
	        // reduce it via `promisedConcat` to get promised array of fulfillments
	        reduce(promisedConcat, resolve([], prototype)).
	        // finally map that to promise of `f.apply(this, args...)`
	        then(execute);
	    };
	  }
	})();


	let group = exports.group = promised(Array);


/***/ },
/* 7 */
/***/ function(module, exports, __webpack_require__) {

	/* This Source Code Form is subject to the terms of the Mozilla Public
	 * License, v. 2.0. If a copy of the MPL was not distributed with this
	 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

	// create namespace
	if (typeof Mozilla == 'undefined') {
		var Mozilla = {};
	}

	;(function($) {
		'use strict';

		// create namespace
		if (typeof Mozilla.UITour == 'undefined') {
			Mozilla.UITour = {};
		}

		var themeIntervalId = null;
		function _stopCyclingThemes() {
			if (themeIntervalId) {
				clearInterval(themeIntervalId);
				themeIntervalId = null;
			}
		}

		function _sendEvent(action, data) {
			var event = new CustomEvent('mozUITour', {
				bubbles: true,
				detail: {
					action: action,
					data: data || {}
				}
			});

			document.dispatchEvent(event);
		}

		function _generateCallbackID() {
			return Math.random().toString(36).replace(/[^a-z]+/g, '');
		}

		function _waitForCallback(callback) {
			var id = _generateCallbackID();

			function listener(event) {
				if (typeof event.detail != 'object')
					return;
				if (event.detail.callbackID != id)
					return;

				document.removeEventListener('mozUITourResponse', listener);
				callback(event.detail.data);
			}
			document.addEventListener('mozUITourResponse', listener);

			return id;
		}

	  var notificationListener = null;
	  function _notificationListener(event) {
	    if (typeof event.detail != 'object')
	      return;
	    if (typeof notificationListener != 'function')
	      return;

	    notificationListener(event.detail.event, event.detail.params);
	  }

		Mozilla.UITour.DEFAULT_THEME_CYCLE_DELAY = 10 * 1000;

		Mozilla.UITour.CONFIGNAME_SYNC = 'sync';
		Mozilla.UITour.CONFIGNAME_AVAILABLETARGETS = 'availableTargets';

	  Mozilla.UITour.ping = function(callback) {
	    var data = {};
	    if (callback) {
	      data.callbackID = _waitForCallback(callback);
	    }
	    _sendEvent('ping', data);
	  };

	  Mozilla.UITour.observe = function(listener, callback) {
	    notificationListener = listener;

	    if (listener) {
	      document.addEventListener('mozUITourNotification',
	                                _notificationListener);
	      Mozilla.UITour.ping(callback);
	    } else {
	      document.removeEventListener('mozUITourNotification',
	                                   _notificationListener);
	    }
	  };

		Mozilla.UITour.registerPageID = function(pageID) {
			_sendEvent('registerPageID', {
				pageID: pageID
			});
		};

		Mozilla.UITour.showHighlight = function(target, effect) {
			_sendEvent('showHighlight', {
				target: target,
				effect: effect
			});
		};

		Mozilla.UITour.hideHighlight = function() {
			_sendEvent('hideHighlight');
		};

		Mozilla.UITour.showInfo = function(target, title, text, icon, buttons, options) {
			var buttonData = [];
			if (Array.isArray(buttons)) {
				for (var i = 0; i < buttons.length; i++) {
					buttonData.push({
						label: buttons[i].label,
						icon: buttons[i].icon,
						style: buttons[i].style,
						callbackID: _waitForCallback(buttons[i].callback)
					});
				}
			}

			var closeButtonCallbackID, targetCallbackID;
			if (options && options.closeButtonCallback)
				closeButtonCallbackID = _waitForCallback(options.closeButtonCallback);
			if (options && options.targetCallback)
				targetCallbackID = _waitForCallback(options.targetCallback);

			_sendEvent('showInfo', {
				target: target,
				title: title,
				text: text,
				icon: icon,
				buttons: buttonData,
				closeButtonCallbackID: closeButtonCallbackID,
				targetCallbackID: targetCallbackID
			});
		};

		Mozilla.UITour.hideInfo = function() {
			_sendEvent('hideInfo');
		};

		Mozilla.UITour.previewTheme = function(theme) {
			_stopCyclingThemes();

			_sendEvent('previewTheme', {
				theme: JSON.stringify(theme)
			});
		};

		Mozilla.UITour.resetTheme = function() {
			_stopCyclingThemes();

			_sendEvent('resetTheme');
		};

		Mozilla.UITour.cycleThemes = function(themes, delay, callback) {
			_stopCyclingThemes();

			if (!delay) {
				delay = Mozilla.UITour.DEFAULT_THEME_CYCLE_DELAY;
			}

			function nextTheme() {
				var theme = themes.shift();
				themes.push(theme);

				_sendEvent('previewTheme', {
					theme: JSON.stringify(theme),
					state: true
				});

				callback(theme);
			}

			themeIntervalId = setInterval(nextTheme, delay);
			nextTheme();
		};

		Mozilla.UITour.addPinnedTab = function() {
			_sendEvent('addPinnedTab');
		};

		Mozilla.UITour.removePinnedTab = function() {
			_sendEvent('removePinnedTab');
		};

		Mozilla.UITour.showMenu = function(name, callback) {
			var showCallbackID;
			if (callback)
				showCallbackID = _waitForCallback(callback);

			_sendEvent('showMenu', {
				name: name,
				showCallbackID: showCallbackID,
			});
		};

		Mozilla.UITour.hideMenu = function(name) {
			_sendEvent('hideMenu', {
				name: name
			});
		};

		Mozilla.UITour.startUrlbarCapture = function(text, url) {
			_sendEvent('startUrlbarCapture', {
				text: text,
				url: url
			});
		};

		Mozilla.UITour.endUrlbarCapture = function() {
			_sendEvent('endUrlbarCapture');
		};

		Mozilla.UITour.getConfiguration = function(configName, callback) {
			_sendEvent('getConfiguration', {
				callbackID: _waitForCallback(callback),
				configuration: configName,
			});
		};

		Mozilla.UITour.showFirefoxAccounts = function() {
			_sendEvent('showFirefoxAccounts');
		};

		Mozilla.UITour.resetFirefox = function() {
			_sendEvent('resetFirefox');
		};

		Mozilla.UITour.addNavBarWidget= function(name, callback) {
			_sendEvent('addNavBarWidget', {
				name: name,
				callbackID: _waitForCallback(callback),
			});
		};

		Mozilla.UITour.setDefaultSearchEngine = function(identifier) {
			_sendEvent('setDefaultSearchEngine', {
				identifier: identifier,
			});
		};

		Mozilla.UITour.setTreatmentTag = function(name, value) {
			_sendEvent('setTreatmentTag', {
				name: name,
				value: value
			});
		};

		Mozilla.UITour.getTreatmentTag = function(name, callback) {
			_sendEvent('getTreatmentTag', {
				name: name,
				callbackID: _waitForCallback(callback)
			});
		};

		Mozilla.UITour.setSearchTerm = function(term) {
			_sendEvent('setSearchTerm', {
				term: term
			});
		};

		Mozilla.UITour.openSearchPanel = function(callback) {
			_sendEvent('openSearchPanel', {
				callbackID: _waitForCallback(callback)
			});
		};

	})();


/***/ },
/* 8 */
/***/ function(module, exports, __webpack_require__) {

	/* This Source Code Form is subject to the terms of the Mozilla Public
	 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
	 * You can obtain one at http://mozilla.org/MPL/2.0/. */

	/*jshint forin:true, noarg:false, noempty:true, eqeqeq:true, bitwise:true,
	  strict:true, undef:true, curly:false, browser:true,
	  unused:true,
	  indent:2, maxerr:50, devel:true, node:true, boss:true, white:true,
	  globalstrict:true, nomen:false, newcap:true, esnext: true, moz: true  */

	/*global require, exports, log */

	"use strict";

	let actions = __webpack_require__(2);

	// module level vars, state between invocations, etc.


	// validation? section.  Sync?  Blocking?
	let shouldRun = exports.shouldRun = function (state) {
	  return true;
	};

	// run / list of actions.  Async?  (I like promises personally)
	let recipe = function (state, callback) {
	  actions.log("everybody recipe is called");
	  callback(true);
	};



	exports.name = "always run example";
	exports.shouldRun = shouldRun;
	exports.recipe = recipe;


/***/ },
/* 9 */
/***/ function(module, exports, __webpack_require__) {

	/* This Source Code Form is subject to the terms of the Mozilla Public
	 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
	 * You can obtain one at http://mozilla.org/MPL/2.0/. */

	/*jshint forin:true, noarg:false, noempty:true, eqeqeq:true, bitwise:true,
	  strict:true, undef:true, curly:false, browser:true,
	  unused:true,
	  indent:2, maxerr:50, devel:true, node:true, boss:true, white:true,
	  globalstrict:true, nomen:false, newcap:true, esnext: true, moz: true  */

	/*global require, exports, log */

	"use strict";

	let config = __webpack_require__(10);
	let actions = __webpack_require__(2);

	let ran30 = function() {
	  return false;
	};  // attempted in last X days?

	let recordAttempt = function () {
	  // record this somewhere?
	  // ye gods, this is such action as a distance :( //
	};


	// showHeartbeat: function(aWindow, aType, aMessage, aFlowId) {

	// valid? section
	// validation? section.  Sync?  Blocking?
	let shouldRun = exports.shouldRun = function (state) {
	  if (ran30()) return false;
	  let myRng = Math.random() * config.expectedUsers;
	  if (myRng <= config.wanted) {
	    recordAttempt();  // async?
	    return true;
	  }
	};

	// run
	let recipe = function (state, callback) {
	  actions.showHeartbeat(null, "stars", "Please Rate Firefox", null);
	  callback(true);
	};



	exports.name = "heartbeat by user v1";
	exports.shouldRun = shouldRun;
	exports.recipe = recipe;


/***/ },
/* 10 */
/***/ function(module, exports, __webpack_require__) {

	/* This Source Code Form is subject to the terms of the Mozilla Public
	 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
	 * You can obtain one at http://mozilla.org/MPL/2.0/. */

	/*jshint forin:true, noarg:false, noempty:true, eqeqeq:true, bitwise:true,
	  strict:true, undef:true, curly:false, browser:true,
	  unused:true,
	  indent:2, maxerr:50, devel:true, node:true, boss:true, white:true,
	  globalstrict:true, nomen:false, newcap:true, esnext: true, moz: true  */

	/*global require, exports, log */

	"use strict";

	// this, like all code, is public visible

	let million = Math.pow(10,6);
	let thousand = Math.pow(10,3);

	exports.expectedUsers = 150 * million;
	//exports.wanted = 20 * thousand;
	exports.wanted = exports.expectedUsers;


/***/ }
/******/ ])