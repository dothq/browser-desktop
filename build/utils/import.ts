import {
    copySync,

    readdirSync
} from "fs-extra";
import { resolve } from "path";
import { log } from "..";
import { COMMON_DIR, PATCHES_DIR, SRC_DIR } from "../constants";
import Patch from "../controllers/patch";
import manualPatches from "../manual-patches";
import { delay } from "./delay";



const checkOff = async (data: string) => {
    await delay(100);
    process.stdout.moveCursor(0, -1)
    process.stdout.clearLine(1)
    log.info(`${data} ✔`);
}

const getChunked = (location: string) => {
    return location.replace(/\\/g, "/").split("/");
};

export const copyManual = (name: string) => {
    copySync(
        resolve(COMMON_DIR, ...getChunked(name)),
        resolve(SRC_DIR, ...getChunked(name))
    );
};

export const importManual = async () => {
    log.info(
        `Applying ${manualPatches.length} manual patches...`
    );

    console.log();

    await delay(500);

    return new Promise(async (res, rej) => {
        var total = 0;

        for await (const { name, action, src } of manualPatches) {
            const p = new Patch({
                name,
                action,
                src,
                type: "manual"
            })

            await p.apply()
        }

        log.success(`Successfully imported ${manualPatches.length} manual patches!`);
        console.log();

        await delay(1000);

        res(total);
    });
};

export const importPatchFiles = async () => {
    const patches = readdirSync(PATCHES_DIR);

    log.info(
        `Applying ${patches.length} patch files...`
    );

    console.log();

    await delay(500);

    for await (const patch of patches) {
        const path = resolve(PATCHES_DIR, patch);

        log.info(`Applying ${patch}...`);

        await delay(250);
    }

    log.success(`Successfully imported ${patches.length} patch files!`)
}