import execa from "execa"
import { existsSync, readFileSync } from "fs"
import { posix, resolve, sep } from "path"
import { log, bin_name } from ".."
import { dispatch } from "../dispatch"

export const init = async (directory: string) => {
    if(process.platform == "win32") {
        log.info("Init does not currently work on Windows filesystems, falling back to bash script. See issue: https://github.com/dothq/browser/issues/514");
        await dispatch("windows-init.sh");
        process.exit(-1);
    } 

    const cwd = process.cwd();

    log.info(`Initialising through Git...`)
    
    const dir = resolve(cwd, directory);

    if(!existsSync(dir)) {
        log.error(`Directory "${directory}" not found.\nCheck the directory exists and run |${bin_name} init| again.`)
    }

    const version = readFileSync(resolve(cwd, directory, "browser", "config", "version_display.txt"), "utf-8");

    if(!version) log.error(`Directory "${directory}" not found.\nCheck the directory exists and run |${bin_name} init| again.`);

    await dispatch("git", ["init"], dir);
    await dispatch("git", ["checkout", "--orphan", version], dir);
    await dispatch("git", ["add", "-f", "."], dir);
    await dispatch("git", ["commit", "-am", `"Firefox ${version}"`], dir);
    await dispatch("git", ["checkout", "-b", "dot"], dir);
} 