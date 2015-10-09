#!/bin/bash
# declare an array called array and define 3 vales

#set -x
set -o nounset
shopt -s expand_aliases

array=( $(cd src/localeStrings;  find * -maxdepth 0 -type d) )
for i in "${array[@]}"
do
  echo translating $i
  ./node_modules/.bin/messageformat -m -l "${i}" "src/localeStrings/${i}/" -o "src/localeStrings/${i}/index.js"
done

echo "all locales built as modules at src/localeStrings/*/index.js"
