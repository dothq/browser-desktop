import chalk from "chalk";
import commander, { Command } from "commander";
import { commands } from "./cmds";
import Log from "./log";
import { errorHandler } from "./utils";

const program = new Command();

export let log = new Log();

program
    .storeOptionsAsProperties(false)
    .passCommandToAction(false);

const {
    dot,
    firefox,
    melon
} = require("../package.json").versions;

export const bin_name = "melon";

program.version(`
\t${chalk.bold("Dot Browser")}     ${dot}
\t${chalk.bold("Firefox")}         ${firefox}
\t${chalk.bold("Melon")}           ${melon}
`);
program.name(bin_name);

commands.forEach(command => {
    if (command.flags && !command.flags.platforms.includes(process.platform)) return;

    const _cmd = commander.command(command.cmd);

    _cmd.description(command.description);

    command?.aliases?.forEach(alias => {
        _cmd.alias(alias);
    })

    command?.options?.forEach(opt => {
        _cmd.option(opt.arg, opt.description)
    });

    _cmd.action(command.controller);

    program.addCommand(_cmd);
});

process.on("uncaughtException", errorHandler);
process.on("unhandledException", (err) =>
    errorHandler(err, true)
);

program.parse(process.argv);
