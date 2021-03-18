import {
    existsSync,
    readdirSync,
    readFileSync
} from "fs-extra";
import { resolve } from "path";
import { log } from "..";
import { dispatch } from "../dispatch";

export const fixLineEndings = async () => {
    const patchesDir = resolve(
        process.cwd(),
        "patches"
    );
    const patches = readdirSync(patchesDir);

    await Promise.all(
        patches.map(async (patch) => {
            const patchContents = readFileSync(
                resolve(patchesDir, patch),
                "utf-8"
            );
            const originalPath = patchContents
                .split("diff --git a/")[1]
                .split(" b/")[0];

            if (
                existsSync(
                    resolve(
                        process.cwd(),
                        "src",
                        originalPath
                    )
                )
            )
                await dispatch(
                    "dos2unix",
                    [patch],
                    resolve(
                        process.cwd(),
                        "patches"
                    )
                );
            else
                log.warning(
                    `Skipping ${patch} as it no longer exists in tree...`
                );
        })
    );
};
