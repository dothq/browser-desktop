import execa from "execa";
import {
    appendFileSync,
    createWriteStream,
    existsSync,
    mkdirSync,
    rmdirSync,
    writeFileSync
} from "fs";
import { copySync, ensureDirSync } from "fs-extra";
import { resolve } from "path";
import { log } from "..";
import {
    COMMON_DIR,
    PATCHES_DIR,
    SRC_DIR
} from "../constants";
import manualPatches from "../manual-patches";

const flags: {
    [key: string]: string;
} = {
    D: "delete",
    M: "modify",
    A: "add"
};

const getFiles = async (flags: string, cwd: string) => {
    let { stdout: ignored } = await execa(
        "git",
        [
            "ls-files",
            `-${flags.toLowerCase()}`,
            "--ignored",
            "--exclude-standard"
        ],
        { cwd }
    );

    let { stdout: fls } = await execa(
        "git",
        [
            "diff",
            `--diff-filter=${flags}`,
            "--name-only",
            "--ignore-space-at-eol"
        ],
        { cwd }
    );

    const files = fls.split("\n").filter((i: any) => {
        return !(
            ignored.split("\n").includes(i) ||
            i == ".gitignore"
        );
    }); // this filters out the manual patches

    log.info(
        `Ignoring ${ignored.split("\n").length} files...`
    );

    const fileNames: any = files.map((f: any) => {
        if (f.length !== 0) {
            return (
                f
                    .replace(/\//g, "-")
                    .replace(/\./g, "-") + ".patch"
            );
        }
    });

    return { files, fileNames };
};

const exportModified = async (
    patchesDir: string,
    cwd: string
) => {
    const { files, fileNames } = await getFiles("M", cwd);

    var filesWritten = 0;

    await Promise.all(
        files.map(async (file: any, i: any) => {
            if (file) {
                try {
                    const proc = execa(
                        "git",
                        [
                            "diff",
                            "--src-prefix=a/",
                            "--dst-prefix=b/",
                            "--full-index",
                            file
                        ],
                        {
                            cwd,
                            stripFinalNewline: false
                        }
                    );
                    const name = fileNames[i];

                    proc.stdout?.pipe(
                        createWriteStream(
                            resolve(patchesDir, name)
                        )
                    );

                    appendFileSync(
                        resolve(PATCHES_DIR, ".index"),
                        `${name} - ${file}\n`
                    );

                    ++filesWritten;
                } catch (e) {
                    log.error(e);
                    return;
                }
            }
        })
    );

    log.info(
        `Wrote ${filesWritten} to patches directory.`
    );
};

const exportFlag = async (
    flag: string,
    cwd: string,
    actions: any[]
) => {
    const { files } = await getFiles(flag, cwd);

    actions.push({
        action: flags[flag],
        target: files
    });

    return actions;
};

const exportManual = async (cwd: string) => {
    return new Promise(async (resol) => {
        manualPatches.forEach((patch) => {
            if (patch.action == "copy") {
                if (typeof patch.src == "string") {
                    const inSrc = resolve(cwd, patch.src);
                    const outsideSrc = resolve(
                        COMMON_DIR,
                        patch.src
                    );

                    if (!existsSync(inSrc))
                        return log.error(
                            `Cannot find "${patch.src}" from manual patches.`
                        );
                    if (!existsSync(outsideSrc))
                        ensureDirSync(outsideSrc); // make sure target dir exists before copying

                    copySync(inSrc, outsideSrc);
                } else if (Array.isArray(patch.src)) {
                    patch.src.forEach((p) => {
                        const inSrc = resolve(cwd, p);
                        const outsideSrc = resolve(
                            COMMON_DIR,
                            p
                        );

                        if (!existsSync(inSrc))
                            return log.error(
                                `Cannot find "${p}" from manual patches.`
                            );
                        if (!existsSync(outsideSrc))
                            ensureDirSync(outsideSrc); // make sure target dir exists before copying

                        copySync(inSrc, outsideSrc);
                    });
                }
            }
        });
    });
};

export const exportPatches = async () => {
    let actions: any[] = [];

    log.info(`Wiping patches directory...`);
    console.log();
    rmdirSync(PATCHES_DIR, { recursive: true });
    mkdirSync(PATCHES_DIR);
    rmdirSync(resolve(process.cwd(), "l10n", "en-US"), {
        recursive: true
    });
    mkdirSync(resolve(process.cwd(), "l10n", "en-US"));
    writeFileSync(resolve(PATCHES_DIR, ".index"), "");

    log.info("Exporting modified files...");
    await exportModified(PATCHES_DIR, SRC_DIR);
    console.log();

    log.info("Exporting deleted files...");
    await exportFlag("D", SRC_DIR, actions);
    console.log();

    log.info("Exporting manual patches...");
    await exportManual(SRC_DIR);
    console.log();

    // log.info("Exporting added files...");
    // await exportFlag("A", cwd, actions);
    // console.log();
};
