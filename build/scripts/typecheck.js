/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const { spawn } = require("child_process");
const { lstatSync, existsSync } = require("fs");
const { parse, resolve } = require("path");

function getRootDir(currPath) {
    if (lstatSync(currPath).isFile()) {
        return getRootDir(parse(currPath).dir)
    }

    if (existsSync(resolve(currPath, "mach")) && existsSync(resolve(currPath, "old-configure.in"))) {
        return currPath;
    } else {
        return getRootDir(resolve(currPath, ".."))
    }
}

function typecheck() {
    const rootDir = getRootDir(process.cwd());

    const proc = spawn([
        resolve(rootDir, "dot", "node_modules", ".bin", "tsc"),
        "--pretty",
        "--noEmit",
        "-p",
        resolve(rootDir, "dot")
    ].join(" "), {
        shell: true,
        stdio: "inherit"
    });

    proc.on("exit", (exitCode) => {
        process.exit(exitCode);
    });
}

typecheck()