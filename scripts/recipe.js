#!/usr/bin/env node

require('shelljs/global');
config.fatal = true;

//require('shelljs/make');  // just as easy to shim!

var args = process.argv.slice(2);
var target = {};

var help = function () {
  console.log("== Available targets == \n");
  Object.keys(target).sort().forEach(function (k) {
    console.log(k,'\n  -', target[k].doc || k);
  });
  console.log("\nhelp", "\n  - print help on all targets");
  exit(0);
};

function runSingleCommand (args) {
  var which = args[0];
  var rest = args.slice(1);

  if (args.length === 0) {
    help();
  }

  switch (which) {
    case "--help":
    case "help":
      help();
      break;
    default:
      if (which in target) {
        target[which].call(null, rest);
      } else {
        console.error(which, "not available.  --help for list");
        exit(1);
      }
  }
}

// from shelljs/make but 'one command style'
setTimeout(function () {runSingleCommand(args);}, 0);



var info = function (which) {
  console.log(which, process.argv);
};


target['new'] = function () {
  info('new');
};
target['new'].doc = "make a new recipe";

target.open = function () {
  info('open');
};
//target['new'].doc = "make a new recipe";


