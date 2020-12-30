import execa from "execa"
import { existsSync } from "fs"
import { resolve } from "path"
import { log, bin_name } from ".."

export const init = async (directory: string) => {
    const dir = resolve(process.cwd(), directory);

    if(!existsSync(dir)) {
        log.error(`Directory "${directory}" not found.\nCheck the directory exists and run |${bin_name} init| again.`)
    }

    await execa("git", ["init", dir])
}