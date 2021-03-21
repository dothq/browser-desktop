import execa from "execa";
import { exists, existsSync } from "fs-extra";
import { resolve } from "path";
import { confirm } from "promptly";
import rimraf from "rimraf";
import { bin_name, log } from "..";
import { SRC_DIR } from "../constants";
import { IPatch } from "../interfaces/patch";
import manualPatches from "../manual-patches";

export const reset = async () => {
    try {
        log.warning(
            "This will clear all your unexported changes in the `src` directory!"
        );
        log.warning(
            `You can export your changes by running |${bin_name} export|.`
        );
        confirm(
            `Are you sure you want to continue?`,
            { default: "false" }
        )
            .then(async (answer) => {
                if (answer) {
                    await execa(
                        "git",
                        ["checkout", "."],
                        { cwd: SRC_DIR }
                    );

                    manualPatches.forEach(async (patch: IPatch) => {
                        const { src, action } = patch;

                        if(action == "copy") {
                            if(typeof(src) == "string") {
                                const path = resolve(SRC_DIR, src);

                                if(existsSync(path)) rimraf.sync(path)
                            } else if(Array.isArray(src)) {
                                src.forEach(i => {
                                    const path = resolve(SRC_DIR, i);

                                    if(existsSync(path)) rimraf.sync(path)
                                })
                            }
                        }
                    })

                    log.success(
                        "Reset successfully."
                    );
                    log.info(
                        "Next time you build, it may need to recompile parts of the program because the cache was invalidated."
                    );
                }
            })
            .catch((e) => e);
    } catch (e) {}
};
