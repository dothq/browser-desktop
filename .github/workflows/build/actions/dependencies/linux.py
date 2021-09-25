import os

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

os.system("sudo apt-get update --fix-missing")

os.system("rustup install 1.53.0")
os.system("rustup default 1.53.0")

os.system(f"sudo apt-get install -y {' '.join(apt_packages)}")
os.system(f"sudo cargo install {' '.join(apt_packages)}")