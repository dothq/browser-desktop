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

cargo_packages = (
    "sccache",
    "cbindgen"
)

pip_packages = (
    
)

# No pip packages currently so let's just comment this out until we need it
# run(f"sudo pip install --upgrade {' '.join(pip_packages)}")

run("sudo apt-get update --fix-missing")

run("curl https://sh.rustup.rs -sSf | sh -s -- -y")
run(". $HOME/.cargo/env")

run("rustup install 1.53.0")
run("rustup default 1.53.0")

run(f"sudo apt-get install -y {' '.join(apt_packages)}")
run(f"sudo cargo install {' '.join(apt_packages)}")