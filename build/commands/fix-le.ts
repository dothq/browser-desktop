import { readdirSync } from "fs-extra";
import { resolve } from "path";
import { dispatch } from "../dispatch"

export const fixLineEndings = () => {
    const patches = readdirSync(resolve(process.cwd(), "patches"));

    patches.forEach(async patch => {
        await dispatch("dos2unix", [patch], resolve(process.cwd(), "patches"));
    })
}