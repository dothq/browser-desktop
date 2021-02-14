import { resolve } from "path";
import { existsSync, readdirSync, readFileSync } from "fs";
import execa from "execa";
import { log, bin_name } from "..";
import rimraf from 'rimraf';
import { copySync, ensureDirSync } from "fs-extra";
import manualPatches from "../manual-patches";
import { dispatch } from "../dispatch";

interface IPatch {
    name: string;
    action: string;
    src: string | string[];
}

const getChunked = (location: string) => {
    return location.replace(/\\/g, "/").split("/")
}

export const importPatches = async () => {
    if(process.platform == "win32") log.warning(`If you get any line ending errors, you should try running |${bin_name} fix-le|.`);

    const patchesDir = resolve(process.cwd(), "patches");
    const actionsLoc = resolve(process.cwd(), "actions.json");
    const cwd = resolve(process.cwd(), "src");

    const patches = readdirSync(patchesDir);

    await execa("git", ["checkout", "."], { cwd })

    await Promise.all(patches.map(async patch => {
        const args = [
            "-p1",
        ]

        if(process.platform == "win32") {
            args.push("--ignore-whitespace")
        }

        args.push("--binary")
        args.push("-i")
        args.push(`../patches/${patch}`)

        const patchContents = readFileSync(resolve(patchesDir, patch), "utf-8");
        const originalPath = patchContents.split("diff --git a/")[1].split(" b/")[0];

        const apply = async () => {
            log.info(`Applying ${patch}...`)

            await execa("patch", args, { cwd, stripFinalNewline: false });

        }

        if(process.platform == "win32") {
            await execa("dos2unix", [originalPath], { cwd, stripFinalNewline: false })
        }

        await execa("patch", [
            "-R",
            ...args
        ], { cwd }).then(async _ => apply()).catch(async _ => apply())
    }))

    let totalActions = 0;

    manualPatches.forEach((patch: IPatch) => {
        log.info(`Applying ${patch.name} patch...`)

        switch (patch.action) {
            case "copy":
                if(typeof(patch.src) == "string") {
                    copySync(
                        resolve(process.cwd(), "common", ...getChunked(patch.src)),
                        resolve(cwd, ...getChunked(patch.src))
                    )

                    ++totalActions;
                } else if(Array.isArray(patch.src)) {
                    patch.src.forEach(i => {
                        ensureDirSync(i);

                        copySync(
                            resolve(process.cwd(), "common", ...getChunked(i)),
                            resolve(cwd, ...getChunked(i))
                        )

                        ++totalActions;
                    })
                }
        }
    })

    log.success(`Successfully applied ${patches.length + totalActions} patches.`)
}
