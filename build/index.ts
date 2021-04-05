import chalk from "chalk";
import { Command } from "commander";
import {
    bootstrap,
    build,
    download,
    downloadArtifacts,
    execute,
    exportFile,
    exportPatches,
    fixLineEndings,
    importPatches,
    init,
    licenseCheck,
    melonPackage,
    reset,
    run,
    status
} from "./commands";
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

program
    .command("download [ffVersion]")
    .description("Download Firefox.")
    .action(download);

program
    .command("init <directory>")
    .alias("initialise")
    .description("Initialise the Firefox directory.")
    .action(init);

program
    .command("build [os]")
    .option('--a, --arch <architecture>', 'Specify architecture for build')
    .description(
        "Build Dot Browser. Specify the OS param for cross-platform builds."
    )
    .action(build);

program
    .command("export")
    .alias("export-patches")
    .description("Export the changed files as patches.")
    .action(exportPatches);

program
    .command("export-file <file>")
    .description("Export a changed file as a patch.")
    .action(exportFile);

program
    .command("import")
    .alias("import-patches")
    .alias("i")
    .option('-m, --minimal', 'Import patches in minimal mode')
    .description("Import patches into the browser.")
    .action(importPatches);

program
    .command("run")
    .description("Run the browser.")
    .action(run);

program
    .command("package")
    .description("Package the browser for distribution.")
    .action(melonPackage);

program
    .command("reset")
    .description(
        "Reset the source directory to stock Firefox."
    )
    .action(reset);

program
    .command("status")
    .description(
        "Status and files changed for src directory."
    )
    .action(status);

program
    .command("execute")
    .description(
        "Execute a command inside the src directory."
    )
    .action(execute);

program
    .command("bootstrap")
    .description("Bootstrap Dot Browser.")
    .action(bootstrap);

program
    .command("fix-le")
    .description(
        "Convert CRLF line endings to Unix LF line endings."
    )
    .action(fixLineEndings);

program
    .command("license-check")
    .alias("lc")
    .description(
        "Check the src directory for the absence of MPL-2.0 header"
    )
    .action(licenseCheck);

if (process.platform == "win32") {
    program
        .command("download-artifacts")
        .description(
            "Download Windows artifacts from GitHub."
        )
        .action(downloadArtifacts);
}

process.on("uncaughtException", errorHandler);
process.on("unhandledException", (err) =>
    errorHandler(err, true)
);

program.parse(process.argv);
