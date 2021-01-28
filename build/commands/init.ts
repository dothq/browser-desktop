import execa from "execa"
import { existsSync, readFileSync } from "fs"
import { resolve } from "path"
import { log, bin_name } from ".."
import { dispatch } from "../dispatch"

export const init = async (directory: string) => {
    log.info(`Initialising through Git...`)
    
    const dir = resolve(process.cwd(), directory);

    if(!existsSync(dir)) {
        log.error(`Directory "${directory}" not found.\nCheck the directory exists and run |${bin_name} init| again.`)
    }

    const version = readFileSync(resolve(process.cwd(), directory, "browser", "config", "version_display.txt"), "utf-8");

    if(!version) log.error(`Directory "${directory}" not found.\nCheck the directory exists and run |${bin_name} init| again.`);

    await dispatch("git", ["init"], dir);
    await dispatch("git", ["checkout", "--orphan", version], dir);
    await dispatch("git", ["add", "-f", "*"], dir);
    await dispatch("git", ["commit", "-am", `"Firefox ${version}"`], dir);
    await dispatch("git", ["checkout", "-b", "dot"], dir);
}