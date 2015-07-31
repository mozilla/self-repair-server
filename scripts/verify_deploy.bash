#!/usr/bin/env bash

### Goal, report on stat of all files.

set -x
set -o nounset
shopt -s expand_aliases

## alias for os.
# http://stackoverflow.com/questions/394230/detect-the-os-from-a-bash-script
if [[ 'Darwin' == $(uname) ]]; then
  echo true;
  alias md5sum='md5'
fi

#if [[ $platform == 'linux' ]]; then
#   alias ls='ls --color=auto'
#elif [[ $platform == 'freebsd' ]]; then
#   alias ls='ls -G'
#fi


echo ''
echo "#### LOCAL ####"
md5sum "$1"

echo ''
echo "** S3 Bucket **"

curl -sLI http://org.mozilla.self-repair.s3-website-us-west-2.amazonaws.com/en-US/repair/index.js

echo ''
echo "** MOZILLA (cloudfront) **"

curl -sL "https://self-repair.mozilla.org/en-US/repair/index.js" | md5sum

echo
