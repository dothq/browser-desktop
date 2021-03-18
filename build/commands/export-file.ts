import execa from "execa";
import { createWriteStream } from "fs";
import { resolve } from "path";
import { log } from "..";

export const exportFile = async (
    file: string
) => {
    const patchesDir = resolve(
        process.cwd(),
        "patches"
    );
    const cwd = resolve(process.cwd(), "src");

    log.info(`Exporting ${file}...`);

    const proc = execa(
        "git",
        [
            "diff",
            "--src-prefix=a/",
            "--dst-prefix=b/",
            "--full-index",
            resolve(cwd, file)
        ],
        { cwd, stripFinalNewline: false }
    );
    const name =
        file
            .replace(/\//g, "-")
            .replace(/\./g, "-") + ".patch";

    proc.stdout?.pipe(
        createWriteStream(
            resolve(patchesDir, name)
        )
    );
    log.info(
        `Wrote "${name}" to patches directory.`
    );
    console.log();
};
