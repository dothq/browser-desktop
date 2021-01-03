import { resolve } from "path";
import execa from "execa";
import { existsSync, mkdirSync, rmdirSync, writeFileSync } from "fs";
import { log } from "..";

const flags: {
    [key: string]: string
} = {
    D: "delete",
    M: "modify",
    A: "add"
}

const getFiles = async (flags: string, cwd: string) => {
    const { stdout: files } = await execa("git", ["diff", `--diff-filter=${flags}`, "--name-only", "--ignore-space-at-eol"], { cwd })
    const fileNames = files.split("\n").map(f => f.replace(/\//g, "-") + ".patch")

    return { files, fileNames };
}

const exportModified = async (patchesDir: string, cwd: string) => {
    const { files, fileNames } = await getFiles("M", cwd);

    await Promise.all(files.split("\n").map(async (file, i) => {
        if(file !== "") {
            const { stdout: diff } = await execa("git", ["diff", "--src-prefix=a/", "--dst-prefix=b/", "--full-index", file], { cwd });
            const name = fileNames[i];
    
            writeFileSync(resolve(patchesDir, name), diff);
            log.info(`Wrote "${name}" to patches directory.`)
        }
    }))
}

const exportFlag = async (flag: string, cwd: string, actions: any[]) => {
    const { files } = await getFiles(flag, cwd);

    actions.push({
        action: flags[flag],
        target: files.split("\n")
    })

    return actions;
}

export const exportPatches = async () => {
    const patchesDir = resolve(process.cwd(), "patches");
    const cwd = resolve(process.cwd(), "firefox");

    let actions: any[] = []

    log.info(`Wiping patches directory...`);
    console.log();
    rmdirSync(patchesDir, { recursive: true });
    mkdirSync(patchesDir);

    log.info("Exporting modified files...");
    await exportModified(patchesDir, cwd);
    console.log();

    log.info("Exporting deleted files...");
    await exportFlag("D", cwd, actions);
    console.log();

    log.info("Exporting added files...");
    await exportFlag("A", cwd, actions);
    console.log();

    log.info("Writing actions...");
    writeFileSync(resolve(process.cwd(), "actions.json"), JSON.stringify(actions, null, 2))
}