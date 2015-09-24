# The Book of Self-Repair (Heartbeat First Impressions)

##  Overall Goals of Self-Repair

1.  Host self-repair recipes, outside of firefox core.  Run them with Firefox permissions.  Allow fast development off the trains.

2.  Collect randomly sampled User Sentiment scores.  Implemented as "Heartbeat First Impressions" recipe.


## As a developer, I want to successfully hack on Self-Repair

### Setup (do once)

1.  Zen Of Cooking

	This is the short version. `Cmd+F` will find bigger explanations of nearly everything later on in this document.

   Mastering this may take several attempts.  Skip around.  Be gentle on yourself!  Enjoy the process!

1. Pots and Pans

	```
	# if you want Homebrew (OSX packages)
	# http://brew.sh/
	ruby -e "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/master/install)"



	# required: git, node
	brew install node   # includes npm
	brew install git    # git

	# optional:  hub, git
	brew install hub    # github's replacement git client
	brew install ghi    # github issues client
	```

1. Groceries

	```
	# usual git project clone and fork

	git clone mozilla/self-repair-server
	cd self-repair-server
	hub fork
	```

1. Prep the veggies

	```
	# usual node project package install
	npm install

	# installs dependecies at `node_modules`.
	```

1. Preheat the oven.

	**Firefox Settings** - allow local UITour debug in `about:config`

	- `browser.uitour.requireSecure;false`
	- `browser.uitour.testingOrigins;http://localhost:3111`

1.  You are ready to cook.  Awesome job.

### Explore

1.  Open the page (this is safe)

    `npm run open-prod`

1.  You should see a HB notification box.

2.  Explore with [DevTools](https://developer.mozilla.org/en-US/docs/Tools/Web_Console#Helper_commands) [Console](https://developer.mozilla.org/en-US/docs/Web/API/console
)  `Alt + Cmd + I`

	`inspect(heartbeat)`



### Modify

```
ghi create -m "Some issue that need fixing"
git checkout -b 151-my-issue


# edit files in `src/`.  Files described below.
# commonest one I edit is:
#
#    src/recipes/heartbeat-by-user-first-impression/index.js

```

### Build

```
npm run compile

# run from anywhere in directory
# rebuilds `deploy/` directory
# outputs at `deploy/en-US/repair/index.js`
# npm silently calls `precompile` and `postcompile`.
# see `package.json` "scripts" for details.
# see "How is Appy Formed" for details of build process.
```


### Debug

```
npm run serve   # serves at http://localhost:3111
npm run open-local
```

### Test

Unit, Integration, Timebomb Testing Styles

```
TRAVIS=1 npm test   # simulates a travis run.

# single file
TRAVIS=1 NPM_CONFIG_KARMAFILES="test/recipes/test-pb-mode-survey.js" npm run test

# 'interactive', bigger logging.
NPM_CONFIG_KARMAFILES="test/recipes/test-pb-mode-survey.js" npm run test
```

(There is more on testing in the **Problems** section below)

### Deploy

```
git checkout your_feature_branch
git push   # you may need to -f if you rebuild a lot.
hub pull-request -i 150   # if you have hub, else use the web interface.

https://github.com/mozilla/self-repair-server/pull/150
```

You will see Travis trying to build this.  Once that works, GET A REVIEW, then merge the branch.


TRAVIS pushes every commit to `mozilla/master` to the AWS (see `.travis.yml`).


### Enjoy

Put your feet up and feel superior.


## But All The Surveys Must Be Deployed!

**Warning**:  This flow is fragile.  New system for this, coming REAL SOON NOW (tm).  _Code review will help, and is your friend_.

1. **Learn From The Elders**:  [Example historical deploy commit](https://github.com/mozilla/self-repair-server/commit/c8f75dee5d).  [Bright Spots Study](https://github.com/mozilla/self-repair-server/pull/156/files).

1. **Write Survey**.   Surveys live at SurveyGizmo (where there are Surveys).

	1. Love users:  Use the fx theme
	1. Fix the link:
		1. Adjust the survey link to be on `qsurvey.m.o`
	   1. Turn on `https`
	1. Love your analyst
	   1. Give sensible shorthand names to questions and answers
	   2. Change your Likerts to output as numeric

1. **Open an issue and branch**.

	```
	ghi create -m "deploy survey Whatever"
	git branch -b <issueNumber>-first-impressions-Whatever
	```

1. **Deploy via First Impressions**.  Direct your mind flow at:

   - `src/recipes/heartbeat-by-user-first-impression/index.js`

      1.  bump version number.
      2.  Edit the various url parts: `https://qsurvey.mozilla.com/s3/Firefox-USE-Survey?source=heartbeat&surveyversion=${VERSION}&updateChannel=${state.updateChannel}&fxVersion=${state.fxVersion}`

   - `src/recipes/heartbeat-by-user-first-impression/index.js`

	  1. adjust deploy percentage by channel, country if needful.

1. **Prove We are Good**. All Tests Must Pass.

   - `package.json`
      - increment minor number

   - `test/recipes/test-heartbeat-by-user-first-impression.js`
   - `test/test-built/test-built-exports.js`
		- fix the version numbers of tests.

1. Commit, Deploy.  See above.

	```
	git add -u
	git commit -m "Fix #XXX, deploy whatever"
	git push
	hub pull-request -i XXX
	```


# Structure of `src/`

- `main.js`: entry for the entire file, per `webpack.config.js`

Other files:

- `common/` used by the `runner` and `recipes/`
- `common/heartbeat`: heartbeat notification code api
- `jetpack` utilities copied from `addon-sdk`
- `recipes/` one folder per recipe.  Will eventually have a more formally defined interface (see #50)
- `repairs.js` actual list of recipes to be run by end users.
- `runner.js` runs the repairs list.

## Architecture

Self-Repair currently piggy-backs on the Firefox UITour system.

- Firefox tour lib:
	- hears messages from content.
	- does tour things: highlight, opentab, user info, change search engine.
	- the 'showHeartbeat' function is crammed into this.
	- (ONLY on https pages with 'uitour' permissions)
	- owned by MattN
- in-content tour lib
  - js that 'requests' and 'answers' messages to the Fx Tour Lib.
  - owned by MattN
- Self-Repair-Server:
  - a one-page app.
  - compiled with webpack, transpiled using babel
  - includes (via `require` the 'in-content tour lib'.
  - uses tour lib to get user info, and `showHeartbeat`
  - has recipes, libs for phoning into Input Server, etc.
  - owned by GreggLind
- Travis-ci.
  - cloud based continuous integration service
  - runs tests on each pull-request
  - deploys all commits on `mozilla/master` to AWS, via commit hook.
  - not owned by Mozilla
- AWS
  - hosted CDN by amazon.
  - Not owned by Mozilla.
- Input Collector
  - `phonehome.js` reports Heartbeat First Impressions attempts and scores to this server.
  - future work will move this flow to Telemetry.
  - owned by WillKG.





## How is Appy Formed?

`npm run compile` does:


1.   **precompile**
1.  Destroy `deploy`
2.  skeletons for all international sites `deploy/*/`
1.  **compile**:
1.  `webpack`, (see `webpack.config.js`),
2.  follows all `requires` from **ENTRY** `src/main.js` to [resolve the file DAG](https://nodejs.org/api/modules.html).
3.  runs all [es6](https://developer.mozilla.org/en-US/docs/Web/JavaScript/New_in_JavaScript/ECMAScript_6_support_in_Mozilla) code through [`babel`](https://babeljs.io/) to convert it to es5 javascript,
4.  outputs the whole 'built' (single script) file at `/deploy/en-US/repair/index.js`.





## Extra Help


- **Fuller Single Page Web App** http://survivejs.com/webpack_react/developing_with_webpack/
- `npm run-script` https://docs.npmjs.com/cli/run-script .  All npm commands work like this:
	- npm pre<command>
	- npm <command>
	- npm post<command>

## Problems We Have Seen

### Pages arent deploying

- TRAVIS-CI is occasionally down.  See https://www.traviscistatus.com/
- Tests fail.  Usual causes:

	1.  The 'uitour lib' updated in `mozilla-central`.  `npm run thirdparty` has instructions for fixing it.
	2.  Updated version in Recipe, but not in tests.  remove this `TRAVIS=1` from your test line.

- AWS can take a while (5-10 min) to deploy worldwide.  Try logging in from a different computer.  Make sure to 'hard refresh' (no cache).



https://github.com/mozilla/self-repair-server/issues/


### Tests aren't working.

- try `npm run thirdpary` first, to see if `mozilla-central` has changed.
- turn off `TRAVIS` env variable.  This will log more and keep Firefox open.  This is all shown in `karma.conf.js`
- the name of your test file must match `test/**/*.js` [(glob-star patterns)](https://github.com/isaacs/node-glob#glob). Else, `karma` will miss it.
- tests use BDD style [Chai.js](http://chaijs.com/api/bdd/).  Plain node `assert` and other test styles should work as well.
- [Karma.js](http://karma-runner.github.io/0.13/index.html) is the runner.

What is `npm test`?

- `npm run compile` runs.
- The test runner `karma` opens Fx with a page that includes

	- the built one-page app
	- es5 transpiled one-page-apps for each 'test' file.  These are the tests.

### Javascript dev is frustrating, and I am sad.

It used to be worse.  (shrug).  [Open an issue](https://github.com/mozilla/self-repair-server/issues/).



## Log of a Real Dev Session - Add `run serve`

Let's add a better `npm run serve` command to replace my hacky old `python -m SimpleHTTPServer` flow.

```
48592 glind ~/gits/self-repair-server [git:master_]$ ghi create -m "better 'serve' for debugging"
#154: better 'serve' for debugging
@gregglind opened this issue 0 seconds ago.   open


Opened on mozilla/self-repair-server.

48597 glind ~/gits/self-repair-server [git:master?]$ git checkout -b 154-better-server
Switched to a new branch '154-better-server'

48598 glind ~/gits/self-repair-server [git:154-better-server_]$ npm install --save-dev serve
  ...

48604 glind ~/gits/self-repair-server [git:154-better-server_]$ git status -s
 M package.json
```

Edit `package.json` `scripts` to  have a new `run serve` command.

```
diff --git a/package.json b/package.json
index 976a732..a216ceb 100644
--- a/package.json
+++ b/package.json
@@ -26,6 +26,7 @@
     "node-uuid": "^1.4.2",
     "opener": "^1.4.0",
     "scriptjs": "^2.5.7",
+    "serve": "^1.4.0",
     "shelljs": "^0.5.1",
     "thirdparty": "file:thirdparty",
     "webpack": "^1.4.13"
@@ -40,7 +41,8 @@
     "postcompile": "node scripts/copy-built-international-sites.js && cp scripts/s3_base/index.html deploy/index.html && cp scripts/s3_base/index.html deploy/error.html",
     "demo": "npm run compile && npm test && coverage/unit/*/index.html # open a repar in a safe way too?",
     "new-recipe": "bash scripts/new-recipe.bash",
-    "thirdparty": "python scripts/check-ui-tour-changes.py thirdparty/uitour.js"
+    "thirdparty": "python scripts/check-ui-tour-changes.py thirdparty/uitour.js",
+    "serve":  "serve -p 3111"
   },
   "author": "Gregg Lind <glind@mozilla.com>",
   "license": "MPL 2"

48610 glind ~/gits/self-repair-server [git:154-better-server?]$ git ci -m "Fix #154 - add 'run serve' command"
[154-better-server a196d59] Fix #154 - add 'run serve' command
 1 file changed, 3 insertions(+), 1 deletion(-)

48611 glind ~/gits/self-repair-server [git:154-better-server?]$ git push
Counting objects: 3, done.
Delta compression using up to 4 threads.
Compressing objects: 100% (3/3), done.
Writing objects: 100% (3/3), 348 bytes | 0 bytes/s, done.
Total 3 (delta 2), reused 0 (delta 0)
To git@github.com:gregglind/self-repair-server
 * [new branch]      154-better-server -> 154-better-server


48613 glind ~/gits/self-repair-server [git:154-better-server?]$ hub pull-request -i 154
Warning: Issue to pull request conversion is deprecated and might not work in the future.
https://github.com/mozilla/self-repair-server/pull/154

48614 glind ~/gits/self-repair-server [git:154-better-server?]$ open https://github.com/mozilla/self-repair-server/pull/154
```



## Rando stuff


Tests

- time bombs
- coverage:  still sucks. I have it built but no good way of monitoring it, so who knows.



