#!/usr/bin/env python3
# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at http://mozilla.org/MPL/2.0/.

import os
import subprocess
import time
from shared.path import get_topsrcdir
from sync_integrity import main as check_sync_integrity
from shared.cmd import run_cmd

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
    topsrcdir = get_topsrcdir()

    print(f"----- Syncing changes with browser-desktop... -----")
    pull("browser-desktop", os.path.join(topsrcdir, "dot"))
    print("")

    revision_file = open(os.path.join(topsrcdir, "dot", "REVISION"), "r")
    revision_file_data = (" ".join(revision_file.read().split())).split(" ")

    upstream_uri = revision_file_data[0]
    revision = revision_file_data[1]

    print(f"----- Syncing changes with gecko-dev... -----")
    try:
        run_cmd(["git", "remote", "set-url", "origin", upstream_uri], topsrcdir)
        fetch("gecko-dev", topsrcdir)
        run_cmd(["git", "merge", revision], topsrcdir)
        run_cmd(["git", "remote", "set-url", "origin", "http://no_fetch.invalid"], topsrcdir)
    except Exception as e:
        try:
            run_cmd(["git", "remote", "set-url", "origin", "http://no_fetch.invalid"], topsrcdir)
        except Exception as e:
            print(f"Failed to reset origin of gecko-dev! This error should be reported.")
            raise e

        raise e

    print("\n-----")
    check_sync_integrity()

    print("\n-----")
    print("\033[92mSuccessfully synchronised.\033[00m")
    print("-----")
if __name__ == "__main__":
    main()