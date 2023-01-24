# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at http://mozilla.org/MPL/2.0/.

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
