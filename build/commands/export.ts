import { readdirSync, readFileSync, writeFile } from "fs-extra";
import { resolve } from "path";
import rimraf from "rimraf";
import { Melon } from "..";
import { info, lightError, warning } from "../utils/log";
import { engineDir, patchesDir } from "../utils/path";
import { $$ } from "../utils/sh";

export class ExportCommand {
    public name = "export";
    public description = "Exports all changes from the engine directory.";

    public aliases = [
        "export-patches",
        "e"
    ]

    public async exec(cli: Melon) {
        rimraf.sync(patchesDir);

        const { data: gitLog } = await $$({ cwd: engineDir, shutUp: true })`git --no-pager log --format='%H'`
        const allCommits = gitLog.split("\n").reverse().map(l => l.replace(/'/g, "")) 
        
        if(!allCommits.length) return warning(`No Git history to engine. Perhaps the repository is corrupt?`)

        await $$({ cwd: engineDir, shutUp: true })`${[
            "git",
            "format-patch",
            `${allCommits[0]}..HEAD`,
            "--unified=10",
            "--keep-subject",
            "-o",
            patchesDir,
        ].join(" ")}`

        const patches = readdirSync(patchesDir).filter(f => f.endsWith(".patch"))

        if(!patches || !patches.length) {
            lightError(`Nothing to export.`);
            process.exit(1);
        }
        info(`Exported patches:`)

        for await(const patch of patches) {
            const path = resolve(patchesDir, patch);

            console.log(`     • ${patch}`);

            await writeFile(
                path, 
                readFileSync(path, { encoding: "utf-8" })
                    .split("\n")
                    .splice(1)
                    .join("\n")
            );
        }
    }
}