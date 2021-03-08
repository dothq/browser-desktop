import { log } from "../";
import { resolve } from "path";
import { bin_name } from "..";
import { dispatch } from "../dispatch";

export const bootstrap = async () => {
    if(process.platform == "win32") log.error(`You do not need to bootstrap on Windows. As long as you ran |${bin_name} download-artifacts| everything should work fine.`)
    const cwd = resolve(process.cwd(), "src");

    log.info(`Bootstrapping Dot Browser for Desktop...`)

    const args = ["--application-choice", "browser"];

    await dispatch(`./mach`, ["bootstrap", ...args], cwd)
}