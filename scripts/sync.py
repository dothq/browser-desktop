#!/usr/bin/env python3
# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at http://mozilla.org/MPL/2.0/.

import os
import subprocess
import time

def main():
    cwd = os.getcwd()
    dir_name = os.path.basename(cwd)

    topsrcdir = ""

    if dir_name == "dot":
        topsrcdir = os.path.abspath("..")
    else:
        remote_url = subprocess.check_output(["git", "remote", "get-url", "origin"], cwd=cwd, shell=False).decode("UTF-8")

        if "gecko-dev" in remote_url:
            topsrcdir = os.getcwd()
        else:
            raise Exception("Unable to sync! We can't find your topsrcdir. You need to be in either the gecko-dev directory or dot directory.")

    print("----- Syncing changes with gecko-dev... -----")
    gecko_dev_process = subprocess.Popen([
        "git", 
        "pull",
        "--verbose"
    ], 
        cwd=topsrcdir,
        stdout=subprocess.PIPE, 
        stderr=subprocess.STDOUT
    )

    while gecko_dev_process.stdout.readable():
        line = gecko_dev_process.stdout.readline()

        if not line:
            break

        ln = line.strip().decode()

        print(f"    {ln}")

    while gecko_dev_process.poll() is None:
        time.sleep(0.5)

    if gecko_dev_process.returncode != 0: 
        print("")
        print("\033[1;91m----- FAILED to sync changes! -----\033[00m")
        exit(1)

    print("")
    print("----- Syncing changes with browser-desktop... -----")
    browser_desktop_process = subprocess.Popen([
        "git", 
        "pull",
        "--verbose"
    ], 
        cwd=os.path.join(topsrcdir, "dot"),
        stdout=subprocess.PIPE, 
        stderr=subprocess.STDOUT
    )

    while browser_desktop_process.stdout.readable():
        line = browser_desktop_process.stdout.readline()

        if not line:
            break

        ln = line.strip().decode()

        print(f"    {ln}")

    while browser_desktop_process.poll() is None:
        time.sleep(0.5)

    if browser_desktop_process.returncode != 0: 
        print("")
        print("\033[1;91m----- FAILED to sync changes! -----\033[00m")
        exit(1)

    print("\n-----")                
    print("\033[92mSuccessfully synchronised.\033[00m")
    print("-----")
if __name__ == "__main__":
    main()