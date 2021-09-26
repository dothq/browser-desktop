import os
import subprocess

os.environ["MACH_USE_SYSTEM_PYTHON"] = "1"
os.environ["MOZ_SOURCE_CHANGESET"] = subprocess.getoutput("git rev-parse HEAD")

os.system("./melon build")