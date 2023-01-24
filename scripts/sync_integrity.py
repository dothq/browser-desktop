#!/usr/bin/env python3
# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at http://mozilla.org/MPL/2.0/.

import subprocess
import os
from shared.path import get_topsrcdir

def main():
    topsrcdir = get_topsrcdir()

    print("Checking synchronisation integrity...")

    revision_file = open(os.path.join(topsrcdir, "dot", "REVISION"), "r")
    revision_file_data = (" ".join(revision_file.read().split())).split(" ")

    revision = revision_file_data[1]
    branch = revision_file_data[2]

    known_latest_remote_revision = ""

    try:
        known_latest_remote_revision = " ".join(subprocess.check_output(
            " ".join(["git", "rev-parse", f"origin/{branch}"]), 
            shell=True,
            cwd=topsrcdir
        ).decode().split())
    except Exception as e:
        print(f"Failed to obtain revision of 'origin/{branch}'.")

        raise e

    if known_latest_remote_revision != revision:
        print("Upstream gecko-dev is not synchronised with browser-desktop.")
        print()
        print("It is recommended to run ./dot/scripts/sync.py assuming you are in the dot directory.")
        print("Otherwise you will run into problems when pushing and pulling.")

        raise
    else:
        print("Passed integrity check.")

if __name__ == "__main__":
    main()