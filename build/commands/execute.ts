import { existsSync } from "fs";
import { log } from "..";
import { ENGINE_DIR } from "../constants";
import { dispatch } from "../utils";

export const execute = async (_: any, cmd: any[]) => {
    if (existsSync(ENGINE_DIR)) {
        if (!cmd || cmd.length == 0)
            log.error(
                "You need to specify a command to run."
            );

        const bin = cmd[0];
        const args = cmd;
        args.shift();

        log.info(
            `Executing \`${bin}${
                args.length !== 0 ? ` ` : ``
            }${args.join(" ")}\` in \`src\`...`
        );
        dispatch(bin, args, ENGINE_DIR, true);
    } else {
        log.error(`Unable to locate src directory.`);
    }
};
