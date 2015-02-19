#!/usr/bin/env node

require('shelljs/global');

console.log(process.argv);

var which = process.argv[1];
var recipe = process.argv[2];

// is this just re-writing npm in order to get out of
switch (which) {
  case 'new': {
    exec('npm run recipe:new', which, {silent:true});
    break;
  }
  case 'open': {
    break;
  }
  case 'destroy': {

    break;
  }
  default:

    break;
}
