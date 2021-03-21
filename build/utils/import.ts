import manualPatches from "../manual-patches";
import { IPatch } from "../interfaces/patch";

import { log } from "..";

import { resolve } from "path";
import { copySync, ensureDirSync } from "fs-extra";
import { COMMON_DIR, SRC_DIR } from "../constants";

const getChunked = (location: string) => {
    return location
        .replace(/\\/g, "/")
        .split("/");
};

export const importManual = () => {
    var total = 0;

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

                    ++total;
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

                        ++total;
                    });
                }
        }
    });

    return total;
}