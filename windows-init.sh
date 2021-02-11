#!/bin/sh

cd src
git init
git config core.autocrlf false
git checkout --orphan ff
echo "Adding source files to Git repo. This may take a while..."
git add . -v
git commit -am "Firefox"
git checkout -b dot

echo "Successfully set up src directory!"