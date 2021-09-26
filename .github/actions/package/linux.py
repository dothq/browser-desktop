import os

os.environ["MACH_USE_SYSTEM_PYTHON"] = "1"

os.chdir("./engine")
print("=> ./engine")

print("=> ./engine/mach")
os.system("./mach package --no-interactive")
os.system("ls obj-*/dist")