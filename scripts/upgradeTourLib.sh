#!/bin/bash

set -x
set -o errexit
set -o nounset
shopt -s expand_aliases

curl -sL "https://hg.mozilla.org/mozilla-central/raw-file/tip/browser/components/uitour/UITour-lib.js" > thirdparty/uitour.js

# increment thirdparty/package.json version
cd thirdparty;
../node_modules/.bin/versiony --patch
cd ..

npm uninstall thirdparty
npm install thirdparty

git add thirdparty
git commit -m "new version of thirdparty, new uitour.js"

