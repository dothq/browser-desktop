import { Command } from 'commander';

import Log from './log';

import { download } from './commands';
import { readFileSync } from 'fs';
import { resolve } from 'path';

const program = new Command();

export let log = new Log();

program
  .storeOptionsAsProperties(false)
  .passCommandToAction(false);

program.version(require("../package.json").version);
program.name("dot");

program
    .command("download [version]")
    .description("Download a release of Firefox.")
    .action(download)

process.on('uncaughtException', (err) => {
    let cc = readFileSync(resolve(__dirname, "command"), "utf-8")
    cc = cc.replace(/(\r\n|\n|\r)/gm, "");

    console.log(`\n\t An error occurred while running command ["${cc.split(" ").join('", "')}"]`)
    console.log(`\n\t`, err.message)
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