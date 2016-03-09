#/usr/bin/env python

"""


"""

import sys
import urllib2
import md5
import difflib


url = "https://hg.mozilla.org/mozilla-central/raw-file/tip/browser/components/uitour/UITour-lib.js"
urlcontent = urllib2.urlopen(url).read()
urlhash = md5.new(urlcontent).hexdigest()
local = sys.argv[1]
localcontent = open(local).read()
localhash = md5.new(localcontent).hexdigest()

advice = """
Bad news, file changed.

## Hashes

local :
  {localhash} {local}

remote:
  {urlhash} {url}


## Diff:

{diff}


## Fix:

npm run fix:thirdparty
./node_modules/.bin/versiony --patch   # if needed
git add -u
git commit

""".format(
  url = url,
  localhash = localhash,
  local = local,
  urlhash = urlhash,
  diff = "".join(list(difflib.unified_diff(localcontent, urlcontent)))
)

if localhash != urlhash:
  print advice
  sys.exit(1)
