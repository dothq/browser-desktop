import execa from "execa";
import { existsSync, readdirSync } from "fs";
import { resolve } from "path";
import { bin_name, log } from "..";

export const run = async () => {
    const cwd = resolve(process.cwd(), "src");
    const dirs = readdirSync(cwd);
    const objDirname: any = dirs.find(dir => {
        return dir.startsWith("obj-")
    });

    const objDir = resolve(cwd, objDirname);

    if(existsSync(objDir)) {
        const artifactPath = resolve(objDir, "dist", "bin", "dot");

        if(existsSync(artifactPath)) {
            log.info("Starting `dot`...")

            execa(artifactPath).stdout?.pipe(process.stdout);
        } else {
            log.error(`Cannot binary with name \`dot\` in ${resolve(objDir, "dist", "bin")}`)
        }
    } else {
        log.error(`Unable to locate any built binaries.\nRun |${bin_name} build| to initiate a build.`)
    }
};