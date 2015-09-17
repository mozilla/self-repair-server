# The Book of Self-Repair (Heartbeat First Impressions)


## As a developer, I want to successfully hack on Self-Repair

### Setup (do once)

1. Pots and Pans

	```
	# required: git, node
	brew install node   # includes npm
	brew install git    # git
	
	# optional
	brew install hub    # github's drop in git client
	brew install ghi    # github issues clien
	```
	

1. Groceries

	```
	# usual clone and fork
	
	git clone mozilla/self-repair-server
	cd self-repair-server
	hub fork       
	```

1. Prep the veggies

	```
	# usual node package install
	npm install   
	# creates dependecies at `node_modules`
	```

1. Adjust the oven.

	**Firefox Settings** - allow local debug in `about:config`
	
	- `browser.uitour.requireSecure;false`
	- `browser.uitour.testingOrigins;http://localhost`


### Modify 

```
ghi create -m "Some issue that need fixing"  
git checkout -b 151-my-issue

# edit files in `src/`

```

### Build 

```
npm run compile  

# rebuilds the `deploy` directory
# outputs at `deploy/en-US/repair/index.js`
# silently calls precompile and postcompile.  
# see `package.json` `scripts`
```

### Debug

open deploy/en-US/repair/index.js  # 

### Test

```
TRAVIS=1 npm test   # simulates a travis run.

# single file

```

local
remote


### Deploy

```
git checkout your_feature_branch
git push   # you may need to -f if you rebuild a lot.
hub pull-request -i 150   # if you have hub, else use the web interface.

https://github.com/mozilla/self-repair-server/pull/150
```
You will see Travis trying to build this.  Once that works, merge the branch.  


TRAVIS pushes every commit to the `mozilla/master` to the AWS.  (as shown in `travis.yml`)


### Enjoy

(photo of feet up on desk)


## All The Surveys Must Be Deployed.

1. Direct your mind flow at:
	
   - `src/recipes/heartbeat-by-user-first-impression/index.js`
      
      1.  bump version number.
      2.  Edit the various url parts: `https://qsurvey.mozilla.com/s3/Firefox-USE-Survey?source=heartbeat&surveyversion=${VERSION}&updateChannel=${state.updateChannel}&fxVersion=${state.fxVersion}`

   - `src/recipes/heartbeat-by-user-first-impression/index.js`

   	  1. adjust deploy percentage by channel, country if needful

1. All Tests Must Pass

   - `package.json`
      - increment minor number

   - `test/recipes/test-heartbeat-by-user-first-impression.js`
   - `test/test-built/test-built-exports.js`
   		- fix the version numbers of tests.	
1. Surveys live at SurveyGizmo (where there are Surveys)

	1. Use the fx theme
	2. Adjust the survey link to be on `qsurvey.m.o`
	3. Give sensible shorthand names to questions

1. Bug, Branch, Commit, Deploy.


# Architecture

Firefox
Service
AWS

#  Goal

host self-repair recipes, outside of firefox core.  Run them with Firefox permissions


# Quest Allies

Travis
Git 
ghi `brew install ghi`, for Git Hub Issues. 
  `ghi create -m "created better docs, before work week"` 
Github comments.
hub `brew install hub`

webpack
mocha


# Tasks

- add a survey
- 


## How is appy made?

npm run compile

webpack, controlled by webpack.config.js, follows the `requires` from `src/main.js`, runs all es6 through `babel` to convert it to es5 javascript, outputs the whole built (single script) file at `/deploy/en-US/repair/index.js`.


npm also calls precompile: which...
and postcompile, which...

## Rando stuff

ghi makes github issues awseom

```
48544 glind ~/gits/self-repair-server [git:master?+]$ ghi create -m "created better docs, before work week"
#151: created better docs, before work week
@gregglind opened this issue 59 minutes from now.   open


Opened on mozilla/self-repair-server.
```

```
git checkout -b 151-better-docs
```


Tests

- time bombs
- coverage:  still sucks. I have it built but no good way of monitoring it, so who knows.


WTF:

http://survivejs.com/webpack_react/developing_with_webpack/



hub clone gregglind/self-repair-server
cd self-repair-server
hub clone gregglind/self-repair-server gh-pages
cd gh-pages
git checkout --orphan gh-pages







