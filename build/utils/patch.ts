import { ensureDirSync, readdirSync } from "fs-extra";
import { resolve } from "path";

export const makeCommitSafe = (msg: string) => {
    const patchesDir = resolve(process.cwd(), "patches");

    ensureDirSync(patchesDir);

    const totalPatches = readdirSync(patchesDir).filter(f => f.endsWith(".patch")).length;

    const friendlyCommitMsg = msg
        .replace(/\s/g, "-")
        .replace(/[^A-Za-z0-9-._]/g, "");
        
    const patchName = `${(totalPatches + 1).toString().padStart(4, "0")}-${friendlyCommitMsg}.patch`;

    return patchName;
}