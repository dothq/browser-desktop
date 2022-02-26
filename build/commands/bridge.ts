import chalk from "chalk";
import { resolve } from "path";
import { hideBin } from "yargs/helpers";
import { Melon } from "..";
import { info, lightError } from "../utils/log";
import { engineDir } from "../utils/path";
import { $$ } from "../utils/sh";
const xargs = require("cross-argv");

export class BridgeCommand {
    public name = "bridge";
    public description =
        "Bridge commands to the engine directory.";

    public aliases = ["br"];

    public async exec(cli: Melon) {
        const bin = hideBin(xargs());
        const args = bin.splice(1);

        if (!args.length) {
            lightError(
                `You need to provide a valid command.`
            );
            info(`Example: ./melon ${bin[0]} git status`);
            return;
        }

        if (args[0] == "mach" || args[0] == "./mach") {
            args[0] = `python3 ${resolve(
                engineDir,
                "mach"
            )}`;
        }

        info(chalk.dim(`› ${engineDir}`));
        $$({ cwd: engineDir })`${args.join(" ")}`;
    }
}
