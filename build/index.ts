import { Command } from 'commander';

import Log from './log';

import { 
    download,
    downloadArtifacts,
    init,
    build,
    exportPatches,
    importPatches,
    run,
    fixLineEndings,
    reset,
    melonPackage, // Apparently 'package' is a reserved keyword
    status,
    execute
} from './commands';

import { readFileSync } from 'fs';
import { resolve } from 'path';
import chalk from 'chalk';

const program = new Command();

export let log = new Log();

program
  .storeOptionsAsProperties(false)
  .passCommandToAction(false);

const { dot, firefox, melon } = require("../package.json").versions

export const bin_name = "melon"

program.version(`
\t${chalk.bold("Dot Browser")}     ${dot}
\t${chalk.bold("Firefox")}         ${firefox}
\t${chalk.bold("Melon")}           ${melon}
`);
program.name(bin_name);

program
    .command("download [ffVersion]")
    .description("Download Firefox.")
    .action(download)

program
    .command("init <directory>")
    .alias("initialise")
    .description("Initialise the Firefox directory.")
    .action(init)

program
    .command("build [os]")
    .description("Build Dot Browser. Specify the OS param for cross-platform builds.")
    .action(build)

program
    .command("export")
    .alias("export-patches")
    .description("Export the changed files as patches.")
    .action(exportPatches)

program
    .command("import")
    .alias("import-patches")
    .description("Import patches into the browser.")
    .action(importPatches)

program
    .command("run")
    .description("Run the browser.")
    .action(run)

program
    .command("package")
    .description("Package the browser for distribution.")
    .action(melonPackage)

program
    .command("reset")
    .description("Reset the source directory to stock Firefox.")
    .action(reset)

program
    .command("status")
    .description("Status and files changed for src directory.")
    .action(status)

program
    .command("execute")
    .description("Execute a command inside the src directory.")
    .action(execute)

if(process.platform == "win32") {
    program
        .command("fix-le")
        .description("Convert CRLF line endings to Unix LF line endings.")
        .action(fixLineEndings)

    program
        .command("download-artifacts")
        .description("Download Windows artifacts from GitHub.")
        .action(downloadArtifacts)
}

process.on('uncaughtException', (err) => {
    let cc = readFileSync(resolve(__dirname, "command"), "utf-8")
    cc = cc.replace(/(\r\n|\n|\r)/gm, "");

    console.log(`\n   ${chalk.redBright.bold("ERROR")} An error occurred while running command ["${cc.split(" ").join('", "')}"]:`)
    console.log(`\n\t`, err.message.replace(/\n/g, "\n\t "))
    if(err.stack) {
        const stack = err.stack.split("\n");
        stack.shift();
        stack.shift();
        console.log(`\t`, stack.join("\n").replace(/(\r\n|\n|\r)/gm, "").replace(/    at /g, "\n\t • "))
    }

    console.log()
    log.info("Exiting due to error.")
});
      

program.parse(process.argv);