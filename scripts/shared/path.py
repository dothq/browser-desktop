# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at http://mozilla.org/MPL/2.0/.

import os

def get_topsrcdir():
    cwd = os.getcwd()
    dir_name = os.path.basename(cwd)

    topsrcdir = ""

    if dir_name == "dot":
        topsrcdir = os.path.abspath("..")
    elif dir_name.startswith("obj-"):
        topsrcdir = os.path.abspath("..")
    else:
        if (
            os.path.isfile(os.path.join(os.getcwd(), "moz.configure")) and 
            os.path.isfile(os.path.join(os.getcwd(), "old-configure.in"))
        ):
            topsrcdir = os.getcwd()
        else:
            raise Exception("Unable to sync! We can't find your topsrcdir. You need to be in either the gecko-dev directory or dot directory.")

    return topsrcdir