import { resolve } from "path";
import { existsSync, readdirSync, readFileSync } from "fs";
import execa from "execa";
import { log } from "..";
import rimraf from 'rimraf';
import { copySync, ensureDirSync } from "fs-extra";
import manualPatches from "../manual-patches";

interface IPatch {
    name: string;
    action: string;
    src: string | string[];
}

const getChunked = (location: string) => {
    return location.replace(/\\/g, "/").split("/")
}

export const importPatches = async () => {
    const patchesDir = resolve(process.cwd(), "patches");
    const actionsLoc = resolve(process.cwd(), "actions.json");
    const cwd = resolve(process.cwd(), "src");

    const patches = readdirSync(patchesDir);

    await Promise.all(patches.map(async patch => {
        await execa("git", [
            "apply",
            "-R",
            `../patches/${patch}`
        ], { cwd }).then(async _ => {
            log.info(`Applying ${patch}...`)

            await execa("git", [
                "apply", 
                "--reject",
                "--whitespace=fix",
                "--verbose",
                `../patches/${patch}`
            ], { cwd, stripFinalNewline: false });
        })
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