#!/bin/sh
# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at http://mozilla.org/MPL/2.0/.

set -e

action=$1

if [ ! -f "$PWD/mach" ]; then
    echo "You must be in the mozilla-central repository in order to use this tool."
    exit 1
fi


last_patch=`exec ls -1 ./dot/patches | sed 's/-.*//g' | sort -n | tail -1`
next_patch=`expr 1 + $last_patch`
root_pwd=$PWD

if [ "$action" = "import" ]
then
    echo "Importing:"
    echo
    
    for file in ./dot/patches/*.patch
    do
        echo "----- $file... -----"

        # --forward is used to skip the patch if it has already been applied
        # || true is used to ignore the error if the patch has already been applied
        patch -p1 --forward < $file || true

        echo "-----"
        echo
    done

    echo "Done."
elif [ "$action" = "export" ]
then
    if [ -x "$2" ]
    then
        echo "Please provide a file name. Usage: $0 $action <filename>"
        exit 1
    fi

    echo "Exporting: ${@:2}"
    echo
    
    git add ${@:2}
    git commit
    git format-patch --start-number $next_patch -1 -o ./dot/patches
else
    echo "Usage: $0 import|export"
    echo ""
    echo "  import:  Import all patches from ./patches"
    echo "  export:  Exports a specific patch. Usage: $0 export <filename>"
    echo ""
fi
