# About Self-Repair-Server

## Overall Flow (User Perspective)


1.  Once per session, attempt to LOAD and RUN the RECIPE LIST in a hidden tab.
2.  (if too many attempts (404s)), fail.
3.  Run each recipe.
4.  Die until next restart.

### Heartbeat (in particular)

1.  If user is not selected (by locale, random sample, and "too soon since last ask"), then die().
2.  Show heartbeat "notificationbox" UI
3.  Phonehome result of each step of interaction with disposable UI key.

## `main.js` is a single module repair running app.

```
npm run build:
  `modules` => `traceur (es6->es5)` => `webpack` => `main.js`
```

## Modules Listing

- `main.js` => compiled file from `webpack`

   - parses debug arguments from url
   - guesses locale
   - loads `repairs.js`
   - calls `runner.runAll(repairsList)`

     - for each repair in `repairs.js`, `attemptRun`

        - async get userstate (`personinfo.personinfo`)
        - `bool repair.shouldRun(personinfo)`.  if `false`, next repair
        - `promise repair.run(personinfo)

- `runner.js`:  Recipe running framework.

- `repairs.js`:  exports list of repairs to be run.

- `common/`

    - `actions.js`: repair actions, including `showHeartbeat` and others in the future
    - `events.js`: event passing library (through `window.document`).
    - `heartbeat-flow.js`: state storage for Heartbeat ux.
    - `heartbeat-phonehome.js`:  data packet upload for Heartbeat.  Will be replaced by Telemetry / Heka pipeline in future.
    - `heartbeat.js`: wraps UITour showHeartbeat function.  In future, that function will live directly in self-repair module.
    - `personinfo.js`:  promised 'personinfo' function that gets user state.  Current implmentation is thin.
    - `request.js`:  simple cors and ajax promised http requests.
    - `upload-validate`:  for 'heartbeat-phonehome'

- `jetpack/`  modules and utilities modified from Mozilla/Addon-sdk



