#!/bin/bash

# this could all be replaced by any of the usual 'skel' installers.

set -o nounset

echo "#creating recipe: $1"

mkdir -p src/recipes/"$1"
cp example-recipe/example.js src/recipes/"$1"/"$1".js
cp example-recipe/test-example.js test/recipes/test-"$1".js
cp example-recipe/_src/* src/recipes/"$1"/

echo "# Readme"

cat example-recipe/_src/README.md


echo "# edit these files"
echo
echo src/recipes/"$1"/* test/recipes/test-"$1".js
echo
