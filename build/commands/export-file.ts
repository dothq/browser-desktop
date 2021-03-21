import execa from "execa";
import { createWriteStream } from "fs";
import { resolve } from "path";
import { log } from "..";
import { PATCHES_DIR, SRC_DIR } from "../constants";

export const exportFile = async (file: string) => {
    log.info(`Exporting ${file}...`);

    const proc = execa(
        "git",
        [
            "diff",
            "--src-prefix=a/",
            "--dst-prefix=b/",
            "--full-index",
            resolve(SRC_DIR, file)
        ],
        {
            cwd: SRC_DIR,
            stripFinalNewline: false
        }
    );
    const name =
        file.replace(/\//g, "-").replace(/\./g, "-") +
        ".patch";

    proc.stdout?.pipe(
        createWriteStream(resolve(PATCHES_DIR, name))
    );
    log.info(`Wrote "${name}" to patches directory.`);
    console.log();
};
