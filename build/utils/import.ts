import {
    appendFileSync,
    copySync,
    readFileSync
} from "fs-extra";
import { resolve } from "path";
import { COMMON_DIR, ENGINE_DIR } from "../constants";

const getChunked = (location: string) => {
    return location.replace(/\\/g, "/").split("/");
};

export const copyManual = (
    name: string,
    noIgnore?: boolean
) => {
    try {
        copySync(
            resolve(COMMON_DIR, ...getChunked(name)),
            resolve(ENGINE_DIR, ...getChunked(name))
        );

        if (!noIgnore) {
            const gitignore = readFileSync(
                resolve(ENGINE_DIR, ".gitignore"),
                "utf-8"
            );

            if (
                !gitignore.includes(
                    getChunked(name).join("/")
                )
            )
                appendFileSync(
                    resolve(ENGINE_DIR, ".gitignore"),
                    `\n${getChunked(name).join("/")}`
                );
        }

        return;
    } catch (e) {
        return e;
    }
};
