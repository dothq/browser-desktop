import execa from "execa";
import { createWriteStream, existsSync } from "fs";
import { ensureDirSync } from "fs-extra";
import { resolve } from "path";
import { log } from "..";
import { ENGINE_DIR, SRC_DIR } from "../constants";

export const exportFile = async (file: string) => {
    log.info(`Exporting ${file}...`);

    if (!existsSync(resolve(ENGINE_DIR, file)))
        throw new Error(
            `File ${file} could not be found in engine directory. Check the path for any mistakes and try again.`
        );

    const proc = execa(
        "git",
        [
            "diff",
            "--src-prefix=a/",
            "--dst-prefix=b/",
            "--full-index",
            resolve(ENGINE_DIR, file)
        ],
        {
            cwd: ENGINE_DIR,
            stripFinalNewline: false
        }
    );
    const name =
        file
            .split("/")
            [
                file.replace(/\./g, "-").split("/")
                    .length - 1
            ].replace(/\./g, "-") + ".patch";

    const patchPath = file
        .replace(/\./g, "-")
        .split("/")
        .slice(0, -1);

    ensureDirSync(resolve(SRC_DIR, ...patchPath));

    proc.stdout?.pipe(
        createWriteStream(
            resolve(SRC_DIR, ...patchPath, name)
        )
    );
    log.info(`Wrote "${name}" to patches directory.`);
    console.log();
};
