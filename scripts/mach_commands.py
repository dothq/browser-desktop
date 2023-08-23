# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at http://mozilla.org/MPL/2.0/.

import argparse
from mach.decorators import Command, SubCommand, CommandArgument

def run_mach(command_context, cmd, **kwargs):
    return command_context._mach_context.commands.dispatch(
        cmd, command_context._mach_context, **kwargs
    )


def run_py(command_context, args):
    return run_mach(command_context, "python", args=args, exec_file="", ipython=False, virtualenv=None)


@Command(
    "import-patches",
    category="dot",
    description="Imports patches into the FF tree",
)
def import_patches_run(command_context):
    return run_py(command_context, args=["dot/scripts/patchtool.py", "import"])

@Command(
    "export-patch",
    category="dot",
    description="Exports a commit to a .patch file",
)
@CommandArgument("args", nargs=argparse.REMAINDER)
def export_patch_run(command_context, args):
    return run_py(command_context, args=["dot/scripts/patchtool.py", "export", *args])

@Command(
    "sync",
    category="dot",
    description="Syncs changes from both the Dot and FF tree",
)
def sync_run(command_context):
    return run_py(command_context, args=["dot/scripts/sync.py"])