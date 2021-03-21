import execa from "execa";
import {
    existsSync,
    readdirSync,
    readFileSync
} from "fs";
import {
    copySync,
    ensureDirSync
} from "fs-extra";
import { resolve } from "path";
import { bin_name, log } from "..";
import {
    COMMON_DIR,
    PATCHES_DIR,
    SRC_DIR
} from "../constants";
import manualPatches from "../manual-patches";
import { delay } from "../utils";

interface IPatch {
    name: string;
    action: string;
    src: string | string[];
}

const getChunked = (location: string) => {
    return location
        .replace(/\\/g, "/")
        .split("/");
};

export const importPatches = async () => {
    if (process.platform == "win32")
        log.warning(
            `If you get any line ending errors, you should try running |${bin_name} fix-le|.`
        );

    const patches = readdirSync(PATCHES_DIR);

    await execa("git", ["checkout", "."], {
        cwd: SRC_DIR
    });

    await Promise.all(
        patches.map(async (patch) => {
            const args: string[] = [];

            args.push("--ignore-space-change");
            args.push("--ignore-whitespace");
            args.push(
                resolve(PATCHES_DIR, patch)
            );

            const patchContents = readFileSync(
                resolve(PATCHES_DIR, patch),
                "utf-8"
            );
            const originalPath = patchContents
                .split("diff --git a/")[1]
                .split(" b/")[0];

            const apply = async () => {
                return new Promise(
                    async (res) => {
                        log.info(
                            `Applying ${patch}...`
                        );

                        if (
                            existsSync(
                                resolve(
                                    SRC_DIR,
                                    originalPath
                                )
                            )
                        ) {
                            execa(
                                "git",
                                [
                                    "apply",
                                    ...args
                                ],
                                {
                                    cwd: SRC_DIR,
                                    stripFinalNewline: false
                                }
                            )
                                .catch((e) => {
                                    throw e;
                                })
                                .then((_) =>
                                    res(true)
                                );
                        } else {
                            log.warning(
                                `Skipping ${patch} as it no longer exists in tree...`
                            );
                            delay(
                                1500
                            ).then((_) =>
                                res(true)
                            );
                        }
                    }
                );
            };

            if (process.platform == "win32") {
                await execa(
                    "dos2unix",
                    [originalPath],
                    {
                        cwd: SRC_DIR,
                        stripFinalNewline: false
                    }
                );
            }

            await execa(
                "git",
                ["apply", "-R", ...args],
                { cwd: SRC_DIR }
            )
                .then(
                    async (_) => await apply()
                )
                .catch(
                    async (_) => await apply()
                );
        })
    );

    let totalActions = 0;

    manualPatches.forEach((patch: IPatch) => {
        log.info(
            `Applying ${patch.name} patch...`
        );

        switch (patch.action) {
            case "copy":
                if (
                    typeof patch.src == "string"
                ) {
                    copySync(
                        resolve(
                            COMMON_DIR,
                            ...getChunked(
                                patch.src
                            )
                        ),
                        resolve(
                            SRC_DIR,
                            ...getChunked(
                                patch.src
                            )
                        )
                    );

                    ++totalActions;
                } else if (
                    Array.isArray(patch.src)
                ) {
                    patch.src.forEach((i) => {
                        ensureDirSync(i);

                        copySync(
                            resolve(
                                COMMON_DIR,
                                ...getChunked(i)
                            ),
                            resolve(
                                SRC_DIR,
                                ...getChunked(i)
                            )
                        );

                        ++totalActions;
                    });
                }
        }
    });

    log.success(
        `Successfully applied ${
            patches.length + totalActions
        } patches.`
    );
    log.info(
        "Next time you build, it may need to recompile parts of the program because the cache was invalidated."
    );
};
