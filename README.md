# Self-Repair Server

Modeled on UI Tour

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

## Issues / Bugs

For now, github issues at https://github.com/mozilla/self-repair-server/issues

