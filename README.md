# Self-Repair Server

Modeled on UI Tour

![build status](https://travis-ci.org/mozilla/self-repair-server.svg)

## setup

```
npm install
```

## build

```
./node_modules/webpack/bin/webpack.js
./node_modules/webpack/bin/webpack.js --progress --colors --watch &
# will need restart if you add new files
```

## Test / Explore

1.  build
2.  open reapir/index.html
3.  open console mode.
4.  profit.


## Goals

### Users
- give good value
- don't download or run things stupidly

### New Recipes
- not gross
- don't repeat yourself (currently unmet)

### Building
- install doesn't need anything too wierd.  `gem`, `pip`, `npm`

### Deploying
- easy for ops
- 12 Steps
- end result a set of static files

### Testing
- possible to test all recipes
- easy to test single recipes in isolation

## Proposed plan:

Build using webpack

- this fails on the individual recipe debug
- fails on 'DRY' (unless GRL gets smarter at node)



## Hey, Build a new Recipe

### Write

- git clone and fork
- make a recipe in recipes

    - copy `always.js`
    - *or* make a directory

- remember that your paths to `common` and such are relative.
- it's okay to `require` new `node` packages, but these will be reviewed.


### Test All The Things

#### Automated

- tests in `/tests/recipes/<yourplace>` to mirror your structure.
- run tests `npm run test:unit --karmafiles="test/**/*.js"
- attempt 100% code coverage

#### Iterative

(tbd, will involve opening page to `localhost:5000` with special args).

1.  'leak' the object to test into `window` scope.

    `window.yourthing = module.exports`

2.  In `karma` **debug page** (http://localhost:9876/debug.html), it should then be available on the command line to play with.

3.  `it.todo`, `it.only` and `npm run test:unit --karmafiles="test/path/yourfile.js"` are your friends.

4.  (when complete, remove the 'leak')


#### Iterative (style 2)

1.  Pack it to include all dependencies.

```
npm run webpack -- test/recipes/always recipe.packed.js
```

2.  Include it in an `html` page.

3.  Debug as you will.


#### Test the runner

```
// parse the query string as JSON => args to modules.
http://localhost:8000/?{%22phonehome%22:{%22testing%22:true},%22runner%22:{%22alwaysRun%22:true},%22personinfo%22:{%22updateChannel%22:%20%22nightly%22,%20%22locale%22:%20%22en-US%22}}/

```

Interesting things are in `window.heartbeat` or `heartbeat`

```
heartbeat.recipes[1].run({},{simulate: true})
heartbeat.personinfo.personinfo().then((d)=>heartbeat.recipes[1].shouldRun(d, null, {randomNumber:.000001})).then(heartbeat.actions.log, heartbeat.actions.log)
```

### Deploy

Make a pull-request against [Mozilla/self-repair-server](http://github.com/mozilla/self-repair-server).

**WARNING** Even if you have privileges, please do not push to that repo directly.  Pull-requests

- leave an audit trail
- allow 'revert'


### Hints and Gotchas

Remember that things in `setTimeout` are hard to catch.  `shouldRun` methods need to be robust to this, or they will break the runner.

```
try {
  setTimeout(function (){throw Error("wut?")}, 0)
} catch (e) {
  console.log("wont catch it!")
}
// wont catch!

/*** BUT ***/

setTimeout(function (){
  try {
    throw Error("wut?")
  } catch (e) {
    console.log("caught it!")
  }
}, 0)

```

Catching a reject in your promise chain:

```
Promise.reject("No").then(
()=>{}, ()=>{return Promise.resolve('ok')}).then(
console.log
)
```



## Issues / Bugs

For now, github issues at https://github.com/mozilla/self-repair-server/issues
