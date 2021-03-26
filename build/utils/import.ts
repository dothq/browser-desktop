import { appendFileSync, copySync, readFileSync } from "fs-extra";
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

        const gitignore = readFileSync(resolve(SRC_DIR, ".gitignore"), "utf-8");

        if (!gitignore.includes(getChunked(name).join("/"))) appendFileSync(resolve(SRC_DIR, ".gitignore"), `\n${getChunked(name).join("/")}`)

        return;
    } catch (e) {
        return e;
    }
};
