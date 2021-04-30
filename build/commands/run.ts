import { existsSync, readdirSync } from "fs";
import { resolve } from "path";
import { bin_name, log } from "..";
import { SRC_DIR } from "../constants";
import { dispatch } from "../utils";

export const run = async () => {
    const dirs = readdirSync(SRC_DIR);
    const objDirname: any = dirs.find((dir) => {
        return dir.startsWith("obj-");
    });

    if (!objDirname) {
        throw new Error(
            "Dot Browser needs to be built before you can do this."
        );
    }

    const objDir = resolve(SRC_DIR, objDirname);

    if (existsSync(objDir)) {
        const artifactPath = resolve(
            objDir,
            "dist",
            "bin",
            "dot"
        );

        if (existsSync(artifactPath)) {
            dispatch(
                "./mach",
                ["run"],
                SRC_DIR,
                true,
                true
            );
        } else {
            log.error(
                `Cannot find a built binary.`
            );
        }
    } else {
        log.error(
            `Unable to locate any built binaries.\nRun |${bin_name} build| to initiate a build.`
        );
    }
};
