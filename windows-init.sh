#!/bin/sh

cd src
git init
git checkout --orphan ff
echo "Adding source files to Git repo. This may take a while..."
git add .
git commit -am "Firefox"
git checkout -b dot

echo "Successfully set up src directory!"