import os

for patch in os.listdir(os.path.join(os.getcwd(), "patches")):
    path = os.path.join(os.getcwd(), "patches", patch)

    fin = open(path, "rb")
    data = data.read().replace(b"\r\n",b"\n")
    fin.close()

    fin = open(path, "wb")
    fin.write(data)
    fin.close()

    print(patch)
    os.system(f"git add {path}")

os.system(f"git commit -m \"💬 Convert to LF line endings\"")