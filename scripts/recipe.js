#!/usr/bin/env node
require('npm-path')(); // and set it, gets 'yo', etc.
require('shelljs/global');
config.fatal = true;

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


target.action1 = function () {
  // do things.
};
target.action1.doc = 'help string for target `action1`';


/*

npm run recipe // die without name?     <- new or open?
npm run recipe:new  <- asks or gives?
npm run recipe:open [recipe?]  <-  needs a recipe?

*/


//require('shelljs/make');  // just as easy to shim!

// recipe new
// reci



var info = function (which) {
  console.log(which, process.argv);
};

//    "recipe": "npm run recipe:new self-repair ${NAME}  &&  npm run recipe:open ${NAME}",
//    "recipe:new": "yo self-repair-recipe ${NAME}",
//    "recipe:open": "opener src/recipes/${NAME}/"



// should I bail if no args, or args isn't a camel case?

target.all = function () {
  if (!arguments[0]) {
    console.log("needs an argument for the fullname");
    error(1);
  }
  target['new'](arguments);
  target.open(arguments);
};
target.all.doc = "call new, then open";

target['new'] = function () {
  exec("yo self-repair-recipe " + arguments[0] );
};
target['new'].doc = "make a new recipe";

target.open = function () {
  exec("opener src/recipes/"+ arguments[0] );
};
target.open.doc = "open pages";


