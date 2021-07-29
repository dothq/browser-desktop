/// <reference path="./linus.d.ts"/>

import distro from "linus";
import { bin_name } from "..";
import { log } from "../";
import { ENGINE_DIR } from "../constants";
import { dispatch } from "../utils";
import { pacmanInstall } from "./bootstrap/arch";

export const bootstrap = async () => {
    if (process.platform == "win32")
        log.error(
            `You do not need to bootstrap on Windows. As long as you ran |${bin_name} download-artifacts| everything should work fine.`
        );

    log.info(`Bootstrapping Dot Browser for Desktop...`);

    const args = ["--application-choice", "browser"];

    if (process.platform === "linux") {
        linuxBootstrap();
    } else {
        console.info(
            `Custom bootstrapping doesn't work on ${process.platform}. Consider contributing to improve support`
        );

        console.info(
            `Passing through to |mach bootstrap|`
        );

        await dispatch(
            `./mach`,
            ["bootstrap", ...args],
            ENGINE_DIR
        );
    }
};

function getDistro(): Promise<string> {
    return new Promise((resolve, reject) => {
        distro.name((err: Error, name: string) => {
            if (name) resolve(name);
            else {
                reject(
                    err || "Failed to get linux distro"
                );
            }
        });
    });
}

async function linuxBootstrap() {
    const distro = await getDistro();

    switch (distro) {
        // Both arch and manjaro use the same package repo and the same package manager
        case "ManjaroLinux":
        case "ArchLinux":
            console.log(
                await pacmanInstall(
                    // Shared packages
                    "base-devel",
                    "nodejs",
                    "unzip",
                    "zip",

                    // Needed for desktop apps
                    "alsa-lib",
                    "dbus-glib",
                    "gtk3",
                    "libevent",
                    "libvpx",
                    "libxt",
                    "mime-types",
                    "nasm",
                    "startup-notification",
                    "gst-plugins-base-libs",
                    "libpulse",
                    "xorg-server-xvfb",
                    "gst-libav",
                    "gst-plugins-good"
                )
            );
            break;

        default:
            log.error(`Unimplemented distro '${distro}'`);
    }
}
