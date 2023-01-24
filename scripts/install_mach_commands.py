#!/usr/bin/env python3
# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at http://mozilla.org/MPL/2.0/.

import os
from shared.path import get_topsrcdir
from shared.cmd import run_cmd

topsrcdir = get_topsrcdir()

mach = open(os.path.join(topsrcdir, "mach"), "r+")

with open(os.path.join(topsrcdir, "mach"), "r") as mach_script:
    data = mach_script.read()

    if "comm/build/mach_initialize.py" not in data and "dot/build/mach_initialize.py" not in data:
        raise Exception("Unable to locate instance of comm mach_initialize.py in mach. This error should be reported.")
    elif "dot/build/mach_initialize.py" in data and "comm/build/mach_initialize.py" not in data:
        raise Exception("Mach commands for Dot Browser has already been installed.")

    data = data.replace("comm/build/mach_initialize.py", "dot/build/mach_initialize.py")

    with open(os.path.join(topsrcdir, "mach"), "w") as f:
        f.write(data)
        f.close()

    mach_script.close()

    run_cmd(["git", "commit", "-m", "'Dot Browser: Install mach commands'", os.path.join(topsrcdir, "mach")], topsrcdir)

    print("Successful.")