import execa from "execa";
import { createWriteStream, existsSync } from "fs";
import { resolve } from "path";
import { log } from "..";
import { BROWSER_DIR, SRC_DIR } from "../constants";

export const exportFile = async (file: string) => {
    log.info(`Exporting ${file}...`);

    if (!existsSync(resolve(SRC_DIR, file)))
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
        createWriteStream(resolve(BROWSER_DIR, ...(file.replace(/\./g, "-") + ".patch").split("/")))
    );
    log.info(`Wrote "${name}" to patches directory.`);
    console.log();
};
