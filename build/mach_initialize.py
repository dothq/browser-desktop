# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at http://mozilla.org/MPL/2.0/.

"""
mach_initialize.py

This file contains initialization code for mach commands that are outside of
the Firefox source repository.
"""

import os
import sys

from build import mach_initialize as mach_init

# Individual files that provide mach commands
MACH_MODULES = [
    "dot/scripts/mach_commands.py"
]

CATEGORIES = {
    "dot": {
        "short": "Dot Browser Development",
        "long": "Mach commands that aid Dot Browser Development",
        "priority": 65,
    },
}

def initialize(topsrcdir):
    driver = mach_init.initialize(topsrcdir)

    # Define Dot mach command categories
    for category, meta in CATEGORIES.items():
        driver.define_category(category, meta["short"], meta["long"], meta["priority"])

    for path in MACH_MODULES:
        driver.load_commands_from_file(os.path.join(topsrcdir, path))

    return driver