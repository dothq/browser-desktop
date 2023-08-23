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

CATEGORIES = {
    "dot": {
        "short": "Dot Browser Development",
        "long": "Mach commands that aid Dot Browser Development",
        "priority": 65,
    },
}

def initialize(topsrcdir, args=()):
    sys.path[0:0] = [
        os.path.join(topsrcdir, module)
        for module in (
            os.path.join("python", "mach"),
            os.path.join("third_party", "python", "packaging"),
            os.path.join("third_party", "python", "pyparsing"),
        )
    ]


    mach_init.CATEGORIES.update(CATEGORIES)

    from mach.command_util import MACH_COMMANDS, MachCommandReference

    DOT_MACH_COMMANDS = {
        "import-patches": MachCommandReference("dot/scripts/mach_commands.py"),
        "export-patch": MachCommandReference("dot/scripts/mach_commands.py"),
        "sync": MachCommandReference("dot/scripts/mach_commands.py"),
    }
    MACH_COMMANDS.update(DOT_MACH_COMMANDS)

    driver = mach_init.initialize(topsrcdir, args)

    return driver