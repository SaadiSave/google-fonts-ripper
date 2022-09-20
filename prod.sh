#!/bin/env sh

# clean
rm -r prod
mkdir prod

# bundle
esbuild index.ts --bundle --target=chrome79,edge79,firefox72,safari13 --format=esm --minify > prod/index.js
minify index.html > prod/index.html
