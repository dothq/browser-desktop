import { copySync } from "fs-extra";
import { resolve } from "path";
import { COMMON_DIR, SRC_DIR } from "../constants";

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
