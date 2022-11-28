#!/usr/bin/env python3
# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at http://mozilla.org/MPL/2.0/.

import os
import subprocess

def main():
    cwd = os.getcwd()
    dir_name = os.path.basename(cwd)

    topsrcdir = ""

    if dir_name == "dot":
        topsrcdir = os.path.abspath("..")
    else:
        remote_url = subprocess.check_output(["git", "remote", "get-url", "origin"], cwd=cwd, shell=False).decode("UTF-8")

        if "mozilla/gecko-dev" in remote_url:
            topsrcdir = os.getcwd()
        else:
            raise Exception("Unable to sync! We can't find your topsrcdir. You need to be in either the gecko-dev directory or dot directory.")

    print("----- Syncing changes with gecko-dev... -----")
    subprocess.run([
        "git", 
        "pull"
    ], 
        cwd=topsrcdir,
        stderr=subprocess.STDOUT
    )

    print("")
    print("----- Syncing changes with browser-desktop... -----")
    subprocess.run([
        "git", 
        "pull"
    ], 
        cwd=os.path.join(topsrcdir, "dot"),
        stderr=subprocess.STDOUT
    )

    print("\n-----")                
    print("\033[92mSuccessfully synchronised.\033[00m")
    print("-----")
if __name__ == "__main__":
    main()