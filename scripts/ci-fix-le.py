import os

for patch in os.listdir(os.path.join(os.getcwd(), "patches")):
    path = os.path.join(os.getcwd(), "patches", patch)

    os.system(f"dos2unix {path}")
    print(patch)