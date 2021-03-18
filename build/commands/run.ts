import execa from "execa";
import { existsSync, readdirSync } from "fs";
import { ensureDirSync } from "fs-extra";
import { resolve } from "path";
import { bin_name, log } from "..";

export const run = async () => {
    const cwd = resolve(process.cwd(), "src");
    const dirs = readdirSync(cwd);
    const objDirname: any = dirs.find((dir) => {
        return dir.startsWith("obj-");
    });

    const objDir = resolve(cwd, objDirname);

    if (existsSync(objDir)) {
        const artifactPath = resolve(
            objDir,
            "dist",
            "bin",
            "dot"
        );

        if (existsSync(artifactPath)) {
            const args = [
                "-no-remote",
                "-profile"
            ];

            args.push(
                resolve(
                    objDir,
                    "tmp",
                    "profile-default"
                )
            );

            ensureDirSync(
                resolve(
                    objDir,
                    "tmp",
                    "profile-default"
                )
            );

            log.info(
                `Starting \`dot\` with args ${JSON.stringify(
                    args
                )}...`
            );

            execa(
                artifactPath,
                args
            ).stdout?.pipe(process.stdout);
        } else {
            log.error(
                `Cannot binary with name \`dot\` in ${resolve(
                    objDir,
                    "dist",
                    "bin",
                    "dot"
                )}`
            );
        }
    } else {
        log.error(
            `Unable to locate any built binaries.\nRun |${bin_name} build| to initiate a build.`
        );
    }
};
