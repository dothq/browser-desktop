import execa from "execa";
import { existsSync } from "fs-extra";
import { resolve } from "path";
import { confirm } from "promptly";
import rimraf from "rimraf";
import { bin_name, log } from "..";
import { SRC_DIR } from "../constants";
import { IPatch } from "../interfaces/patch";
import manualPatches from "../manual-patches";

export const reset = async ({
    hard
}: {
    hard?: boolean;
}) => {
    try {
        if (hard) {
            log.hardWarning(
                "You have --hard mode enabled. Typing `yes` will DELETE the entire `src` directory!"
            );
        } else {
            log.warning(
                "This will clear all your unexported changes in the `src` directory!"
            );
        }
        log.warning(
            `You can export your changes by running |${bin_name} export|.`
        );
        confirm(`Are you sure you want to continue?`, {
            default: "false"
        })
            .then(async (answer) => {
                if (answer) {
                    await execa(
                        "git",
                        ["checkout", "."],
                        { cwd: SRC_DIR }
                    );

                    manualPatches.forEach(
                        async (patch: IPatch) => {
                            const { src, action } = patch;

                            if (action == "copy") {
                                if (
                                    typeof src == "string"
                                ) {
                                    const path = resolve(
                                        SRC_DIR,
                                        src
                                    );

                                    if (
                                        path !== SRC_DIR
                                    ) {
                                        log.info(
                                            `Deleting ${src}...`
                                        );

                                        if (
                                            existsSync(
                                                path
                                            )
                                        )
                                            rimraf.sync(
                                                path
                                            );
                                    }
                                } else if (
                                    Array.isArray(src)
                                ) {
                                    src.forEach((i) => {
                                        const path =
                                            resolve(
                                                SRC_DIR,
                                                i
                                            );

                                        if (
                                            path !==
                                            SRC_DIR
                                        ) {
                                            log.info(
                                                `Deleting ${i}...`
                                            );

                                            if (
                                                existsSync(
                                                    path
                                                )
                                            )
                                                rimraf.sync(
                                                    path
                                                );
                                        }
                                    });
                                }
                            } else {
                                log.warning(
                                    "Resetting does not work on manual patches that have a `delete` action, skipping..."
                                );
                            }
                        }
                    );

                    let leftovers = new Set();

                    const { stdout: origFiles } =
                        await execa(
                            "git",
                            [
                                "clean",
                                "-e",
                                "'!*.orig'",
                                "--dry-run"
                            ],
                            { cwd: SRC_DIR }
                        );

                    const { stdout: rejFiles } =
                        await execa(
                            "git",
                            [
                                "clean",
                                "-e",
                                "'!*.rej'",
                                "--dry-run"
                            ],
                            { cwd: SRC_DIR }
                        );

                    origFiles
                        .split("\n")
                        .map((f) =>
                            leftovers.add(
                                f.replace(
                                    /Would remove /,
                                    ""
                                )
                            )
                        );
                    rejFiles
                        .split("\n")
                        .map((f) =>
                            leftovers.add(
                                f.replace(
                                    /Would remove /,
                                    ""
                                )
                            )
                        );

                    Array.from(leftovers).forEach(
                        (f: any) => {
                            const path = resolve(
                                SRC_DIR,
                                f
                            );

                            if (path !== SRC_DIR) {
                                log.info(
                                    `Deleting ${f}...`
                                );

                                rimraf.sync(
                                    resolve(SRC_DIR, f)
                                );
                            }
                        }
                    );

                    if (hard) {
                        log.info(`Deleting src...`);

                        rimraf.sync(resolve(SRC_DIR));
                    }

                    log.success("Reset successfully.");
                    if (!hard)
                        log.info(
                            "Next time you build, it may need to recompile parts of the program because the cache was invalidated."
                        );
                }
            })
            .catch((e) => e);
    } catch (e) {}
};
