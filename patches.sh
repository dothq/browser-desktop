#!/bin/sh
# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at http://mozilla.org/MPL/2.0/.

set -e

action=$1

# Make sure the user has specified the location of mozilla-central in their 
# environment. Some people (i.e. trickypr) prefer to clone it into other places 
if [ ! -f .moz-central ]
then
    echo "Please make sure you specify the location of your checkout of `mozilla-central`"
    echo "inside of the `.moz-central` file."
    exit 1
fi

mozilla_central_repo=$(cat .moz-central)
last_patch=`exec ls -1 ./patches | sed 's/-.*//g' | sort -n | tail -1`
next_patch=`expr 1 + $last_patch`
root_pwd=$PWD

if [ "$action" = "import" ]
then
    echo "Importing:"
    echo
    
    cd $mozilla_central_repo
    for file in $root_pwd/patches/*.patch
    do
        echo "  $file..."
        # --forward is used to skip the patch if it has already been applied
        # || true is used to ignore the error if the patch has already been applied
        patch -p1 --forward < $file || true
    done

    cd $root_pwd
elif [ "$action" = "export" ]
then
    if [ -x "$2" ]
    then
        echo "Please provide a file name. Usage: $0 $action <filename>"
        exit 1
    fi

    echo "Exporting: ${@:2}"
    echo
    
    cd $mozilla_central_repo
    git add ${@:2}
    git commit
    git format-patch --start-number $next_patch -1 -o $root_pwd/patches
    cd $root_pwd
else
    echo "Usage: $0 import|export"
    echo
    echo "  import:  Import all patches in ./patches"
    echo "  export:  Exports a specific patch. Usage: $0 export <filename>"
fi
