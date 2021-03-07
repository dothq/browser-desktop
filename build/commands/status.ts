import execa from "execa";
import { existsSync, readdirSync } from "fs";
import { ensureDirSync } from "fs-extra";
import { resolve } from "path";
import { bin_name, log } from "..";
import { dispatch } from "../dispatch";

export const status = async () => {
    const cwd = resolve(process.cwd(), "src");

    if(existsSync(cwd)) {
        dispatch("git", ["status"], cwd);
    } else {
        log.error(`Unable to locate src directory.`)
    }
};