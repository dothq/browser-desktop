#!/usr/bin/env python3
# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at http://mozilla.org/MPL/2.0/.

import os
import subprocess
import time

def run_cmd(command, cwd):
    process = subprocess.Popen(command, 
        cwd=cwd,
        stdout=subprocess.PIPE, 
        stderr=subprocess.STDOUT
    )

    while process.stdout.readable():
        line = process.stdout.readline()

        if not line:
            break

        ln = line.strip().decode()

        print(f"    {ln}")

    while process.poll() is None:
        time.sleep(0.5)

    if process.returncode != 0:
        raise Exception("Failed to run command")

def run_sync(name, dir, command):
    try:
        run_cmd(command, dir)
    except Exception as e:
        print("")
        print("\033[1;91m----- FAILED to sync changes! -----\033[00m")
        exit(1)

def pull(name, dir):
    run_sync(name, dir, ["git", "pull", "--verbose"])

def fetch(name, dir):
    run_sync(name, dir, ["git", "fetch", "--verbose"])

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

    print(f"----- Syncing changes with browser-desktop... -----")
    pull("browser-desktop", os.path.join(topsrcdir, "dot"))
    print("")

    revision_file = open(os.path.join(topsrcdir, "dot", "REVISION"), "r")
    revision = " ".join(revision_file.read().split())

    print(f"----- Syncing changes with gecko-dev... -----")
    fetch("gecko-dev", topsrcdir)
    run_cmd(["git", "merge", revision], topsrcdir)

    print("\n-----")
    print("\033[92mSuccessfully synchronised.\033[00m")
    print("-----")
if __name__ == "__main__":
    main()