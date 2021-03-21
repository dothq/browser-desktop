import {
    copySync,
    ensureDirSync,
    statSync
} from "fs-extra";
import { resolve } from "path";
import { log } from "..";
import {
    COMMON_DIR,
    SRC_DIR
} from "../constants";
import { IPatch } from "../interfaces/patch";
import manualPatches from "../manual-patches";
import { delay } from "./delay";

const getChunked = (location: string) => {
    return location
        .replace(/\\/g, "/")
        .split("/");
};

const copy = (name: string) => {
    copySync(
        resolve(
            COMMON_DIR,
            ...getChunked(name)
        ),
        resolve(SRC_DIR, ...getChunked(name))
    );
};

export const importManual = async () => {
    log.info(
        `Applying ${manualPatches.length} manual patches...`
    );

    await delay(500);

    return new Promise((res, rej) => {
        var total = 0;

        manualPatches.forEach(
            (patch: IPatch) => {
                const { name, src } = patch;

                log.info(
                    `Applying ${name} manual patch...`
                );

                switch (patch.action) {
                    case "copy":
                        if (
                            typeof src ==
                            "string"
                        )
                            copy(src);
                        ++total;

                        if (
                            Array.isArray(src)
                        ) {
                            src.forEach((i) => {
                                if (
                                    statSync(
                                        i
                                    ).isDirectory()
                                ) {
                                    ensureDirSync(
                                        i
                                    );
                                }

                                copy(i);

                                ++total;
                            });
                        }
                }
            }
        );

        res(total);
    });
};
