import { resolve } from "path";
import { existsSync, readdirSync, readFileSync } from "fs";
import execa from "execa";
import { log } from "..";
import rimraf from 'rimraf';
import { copySync } from "fs-extra";

export const importPatches = async () => {
    const patchesDir = resolve(process.cwd(), "patches");
    const actionsLoc = resolve(process.cwd(), "actions.json");
    const cwd = resolve(process.cwd(), "src");

    const patches = readdirSync(patchesDir);

    await Promise.all(patches.map(async patch => {
        log.info(`Applying ${patch}...`)

        await execa("git", [
            "apply", 
            "--3way", 
            `../patches/${patch}`
        ], { cwd, stripFinalNewline: false });
    }))

    let totalActions = 0;

    if(existsSync(actionsLoc)) {
        const actions = JSON.parse(readFileSync(actionsLoc, "utf-8"));

        actions.map((action: any) => {
            if(action.action == "delete" && action.target[0] !== "") {
                action.target.map(async (f: string) => {
                    log.info(`Applying ${f} patch-action...`)

                    rimraf.sync(f);
                    ++totalActions;
                })
            }
        })
    }

    log.info("Applying branding patch...")
    copySync(
        resolve(process.cwd(), "common", "browser", "branding", "dot"),
        resolve(cwd, "browser", "branding", "dot")
    )

    log.info("Applying dot.js patch...")
    copySync(
        resolve(process.cwd(), "common", "browser", "app", "profile", "dot.js"),
        resolve(cwd, "browser", "app", "profile", "dot.js")
    )

    log.info(`Successfully applied ${patches.length + totalActions + 2} patches.`)
}