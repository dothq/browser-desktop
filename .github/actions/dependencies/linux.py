import os
import subprocess
import sys

from util import run

apt_packages = (
    "libpulse-dev",
    "clang",
    "libpango1.0-dev",
    "nasm",
    "m4",
    "build-essential",
    "libgtk-3-dev",
    "glib-2.0",
    "gtk+-2.0",
    "libdbus-glib-1-dev",
    "libx11-dev",
    "libx11-xcb-dev",
    "yasm",
    "libgtk2.0-dev",
    "libpython3-dev",
    "uuid",
    "libasound2-dev",
    "libcurl4-openssl-dev",
    "libdbus-1-dev",
    "libdrm-dev",
    "libxt-dev",
    "xvfb"
)

pip_packages = (
    
)

def install_apt_packages():
    run("sudo apt-get update --fix-missing")
    run(f"sudo apt-get install -y {' '.join(apt_packages)}")

def install_pip_packages():
    run(f"sudo pip install --upgrade {' '.join(pip_packages)}")

def install_rust():
    run("curl https://sh.rustup.rs -sSf | sh -s -- -y")
    run("chmod +x $HOME/.cargo/env")
    run("$HOME/.cargo/env")
    run(". $HOME/.cargo/env")

    run("rustup install 1.53.0")
    run("rustup default 1.53.0")

if len(sys.argv) > 1:
    if sys.argv[1] == "apt":
        install_apt_packages()

    if sys.argv[1] == "rust":
        install_rust()

    if sys.argv[1] == "pip":
        install_pip_packages()