import {
    existsSync,
    readdirSync,
    readFileSync
} from "fs-extra";
import { resolve } from "path";
import { log } from "..";
import { ENGINE_DIR, PATCHES_DIR } from "../constants";
import { dispatch } from "../utils";

export const fixLineEndings = async () => {
    let patches = readdirSync(PATCHES_DIR);

    patches = patches.filter((p) => p !== ".index");

    await Promise.all(
        patches.map(async (patch) => {
            const patchContents = readFileSync(
                resolve(PATCHES_DIR, patch),
                "utf-8"
            );
            const originalPath = patchContents
                .split("diff --git a/")[1]
                .split(" b/")[0];

            if (
                existsSync(
                    resolve(ENGINE_DIR, originalPath)
                )
            ) {
                dispatch(
                    "dos2unix",
                    [originalPath],
                    ENGINE_DIR
                ).then(async (_) => {
                    await dispatch(
                        "dos2unix",
                        [patch],
                        PATCHES_DIR
                    );
                });
            } else {
                log.warning(
                    `Skipping ${patch} as it no longer exists in tree...`
                );
            }
        })
    );
};
