import {
    copySync
} from "fs-extra";
import { resolve } from "path";
import { log } from "..";
import { COMMON_DIR, SRC_DIR } from "../constants";
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
    try {
        copySync(
            resolve(COMMON_DIR, ...getChunked(name)),
            resolve(SRC_DIR, ...getChunked(name))
        );

        return;
    } catch (e) {
        return e;
    }
};

