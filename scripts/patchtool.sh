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

python3 -c 'with open(".gitignore", "r") as gir:
    if gir.read().find("*.rej") == -1:
        gir.close()
        with open(".gitignore", "a") as gia:
            gia.write("\n# Dot Browser: Patch rejection files\n*.rej\n")
            gia.close()'

echo "#!/bin/bash
./dot/scripts/patchtool.sh" > $PWD/.git/hooks/post-merge

if [ "$action" = "import" ]
then
    total_patches=`expr 0 + $last_patch`

    echo "Importing ${total_patches} patches..."
    echo

    for file in ./dot/patches/*.patch
    do
        echo "----- $file -----"

        _=$(git apply \
            --reverse \
            --check \
            --ignore-whitespace \
            --ignore-space-change \
            $file > /dev/null 2>&1)

        apply_status=$?
    
        if [ $apply_status -eq 0 ]
        then
            echo -e "\e[0;33mSkipped patch as it was already applied.\e[0m"
        else
            out=$(git apply \
                --ignore-whitespace \
                --ignore-space-change \
                --verbose \
                --quiet \
                $file)

            status=$?
            echo $status

            if [ $status -eq 0 ]
            then
                echo -e "\e[32mSuccessfully applied.\e[0m"
            else
                echo -e "\e[0;31m$(out)\e[0m"
            fi
        fi
        echo "-----"
        echo
    done

    echo "Done."
elif [ "$action" = "export" ]
then
    if [ -x "$2" ]
    then
        echo "Please provide a file name. Usage: $0 $action <...filename>"
        exit 1
    fi

    echo "Exporting: ${@:2}"
    echo
    
    git commit ${@:2}
    git format-patch --start-number $next_patch -1 -o ./dot/patches

    echo
    echo "Attempting to apply all patches cleanly..."

    $0 import
elif [ "$action" = "edit" ]
then
    if [ -x "$2" ]
    then
        echo "Please provide a file name. Usage: $0 $action <filename>"
        exit 1
    fi

    if ! [ -x "$(command -v editdiff)" ]; then
        echo "patchutils is required to be installed in order to run the edit command."
        exit 1
    fi

    editdiff ${@:2}
    rm ${@:2}.orig
else
    echo "Usage: $0 import|export"
    echo ""
    echo "  import:  Import all patches from ./patches"
    echo "  export:  Exports a specific patch. Usage: $0 export <...filename>"
    echo "  edit:    Edit a patch contents. Usage: $0 edit <filename>"
    echo ""
fi
