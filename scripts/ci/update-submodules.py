#!/usr/bin/env python3
# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at http://mozilla.org/MPL/2.0/.

import os
import subprocess
import sys


def main():
    args = sys.argv
    args = args[1:]

    path = args[0]

    if path:
        os.system(f"git submodule sync --recursive {path}")
        os.system(f"git submodule update --init --recursive {path}")
    else:
        os.system("git submodule sync --recursive")
        os.system("git submodule update --init --recursive")

    proc = subprocess.Popen(["git", "submodule"], stdout=subprocess.PIPE)
    modules = proc.stdout.read().decode("utf-8").split("\n")
    modules.pop() # remove trailing newline

    if len(modules) == 0:
        raise Exception("No modules found.")

    for mod in modules:
        mod_path = mod.split(" ")[2]

        if path and len(path) != 0 and path != mod_path:
            continue

        latest_revision = subprocess.check_output([
            "git", 
            "log", 
            "--branches", 
            "-1", 
            "--pretty=format:\"%H\""
        ], cwd=mod_path)
        rev = latest_revision.decode("utf-8").replace("\n", "")

        subprocess.call(["git", "fetch"], cwd=mod_path) 
        subprocess.call(["git", "checkout", rev], cwd=mod_path) 

        os.system(f"git commit .gitmodules {mod_path} -m \"🆙 Update '{mod_path}' submodule\"")

if __name__ == "__main__":
    main()
