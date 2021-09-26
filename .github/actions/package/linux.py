import os
import subprocess
import sys

os.environ["MACH_USE_SYSTEM_PYTHON"] = "1"

from util import run

os.chdir("./engine")
print("=> ./engine")

print("=> ./engine/mach")
run("./mach package")