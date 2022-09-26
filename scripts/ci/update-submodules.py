#!/usr/bin/env python3
# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at http://mozilla.org/MPL/2.0/.

import os
import subprocess


def main():
    os.system("git submodule sync --recursive")
    os.system("git submodule update --init --recursive")

    proc = subprocess.Popen(["git", "submodule"], stdout=subprocess.PIPE)
    modules = proc.stdout.read().decode("utf-8").split("\n")
    modules.pop() # remove trailing newline

    if len(modules) == 0:
        raise Exception("No modules found.")

    for mod in modules:
        path = mod.split(" ")[2]

        print(path)

        latest_revision = subprocess.check_output([
            "git", 
            "log", 
            "--branches", 
            "-1", 
            "--pretty=format:\"%H\""
        ], cwd=path)
        rev = latest_revision.decode("utf-8").replace("\n", "")

        subprocess.call(["git", "fetch"], cwd=path) 
        subprocess.call(["git", "checkout", rev], cwd=path) 

        os.system(f"git commit .gitmodules {path} -m \"🆙 Update '{path}' submodule\"")

if __name__ == "__main__":
    main()
