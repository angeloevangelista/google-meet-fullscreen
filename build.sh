#!/bin/zsh

set -e

rm -rf dist temp

mkdir temp dist

mv temp dist/dist/

cp -r manifest.json dist
cp -r extension dist

cd dist

zip -r ../dist.zip *

cd -
