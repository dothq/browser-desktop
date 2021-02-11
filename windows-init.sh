#!/bin/sh

cd src
git init
git config core.autocrlf false
git checkout --orphan ff
echo "Adding source files to Git repo. This may take a while..."
git add . -v > /dev/null
git commit -am "Firefox" > /dev/null
git checkout -b dot

echo "Successfully set up src directory!"