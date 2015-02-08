// Karma configuration

/* features of this Karma conf:
-
- each test is run as a webpack
- es6 okay in sources and tests
-
*/


module.exports = function(config) {
  config.set({

    // base path that will be used to resolve all patterns (eg. files, exclude)
    basePath: '',


    // frameworks to use
    // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
    frameworks: ['mocha'],


    // list of files / patterns to load in the browser
    files: [
      {pattern: 'app/index.js', included: true},
      {pattern: 'test-integration/*.js', included: true}
    ],

    // list of files to exclude
    exclude: [
    ],

    // preprocess matching files before serving them to the browser
    // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
    preprocessors: {
      'test-integration/*': ['webpack'] // traceur at
    },

    plugins: [
        'karma-coverage',   // for the reporter
        'karma-webpack',
        'karma-mocha',
        'karma-firefox-launcher'
    ],

    webpack: {
      module: {
        loaders: [
          { // << traceur
            test: /\.js$/,
            // have to traceur the tests too.
            exclude: /(node_modules|bower_components)\//,
            loader: 'traceur'
          }
        ],
        postLoaders: [
          {
            test: /\.js$/,
            exclude: /(node_modules|bower_components)\//,
            loader: 'istanbul-instrumenter'
          }
        ],
      },
    },

    // test results reporter to use
    // possible values: 'dots', 'progress'
    // available reporters: https://npmjs.org/browse/keyword/karma-reporter
    reporters: ['progress', 'dots', 'coverage'],


    // web server port
    port: 9876,


    // enable / disable colors in the output (reporters and logs)
    colors: true,


    // level of logging
    // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
    logLevel: config.LOG_INFO,
    //


    // enable / disable watching file and executing tests whenever any file changes
    autoWatch: true,


    // start these browsers
    // available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
    browsers: ['Firefox'],


    // Continuous Integration mode
    // if true, Karma captures browsers, runs the tests and exits
    singleRun: true,

    // coverage report.
    coverageReporter: {
      type : 'html',
      dir : 'coverage/integration'
    }
  });
};
