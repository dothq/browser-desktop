import { existsSync, readdirSync } from "fs";
import { resolve } from "path";
import { bin_name, log } from "..";
import { ENGINE_DIR } from "../constants";
import { dispatch } from "../utils";

export const run = async (chrome?: string) => {
    const dirs = readdirSync(ENGINE_DIR);
    const objDirname: any = dirs.find((dir) => {
        return dir.startsWith("obj-");
    });

    if (!objDirname) {
        throw new Error(
            "Dot Browser needs to be built before you can do this."
        );
    }

    const objDir = resolve(ENGINE_DIR, objDirname);

    if (existsSync(objDir)) {
        dispatch(
            "./mach",
            ["run"].concat(
                chrome ? ["-chrome", chrome] : []
            ),
            ENGINE_DIR,
            true,
            true
        );
    } else {
        log.error(
            `Unable to locate any built binaries.\nRun |${bin_name} build| to initiate a build.`
        );
    }
};
