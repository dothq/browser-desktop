import execa from "execa";
import { existsSync, readdirSync } from "fs";
import { ensureDirSync } from "fs-extra";
import { resolve } from "path";
import { bin_name, log } from "..";
import { dispatch } from "../dispatch";

export const execute = async (_: any, cmd: any[]) => {
    const cwd = resolve(process.cwd(), "src");

    if(existsSync(cwd)) {
        if(!cmd || cmd.length == 0) log.error("You need to specify a command to run.")

        const bin = cmd[0];
        const args = cmd;
        args.shift();

        log.info(`Executing \`${bin}${args.length !== 0 ? ` ` : ``}${args.join(" ")}\` in \`src\`...`)
        dispatch(bin, args, cwd, true);
    } else {
        log.error(`Unable to locate src directory.`)
    }
};