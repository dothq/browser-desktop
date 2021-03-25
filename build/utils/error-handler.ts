import chalk from "chalk";
import { readFileSync } from "fs-extra";
import { resolve } from "path";
import { log } from "..";

export const errorHandler = (
    err: Error,
    isUnhandledRej: boolean
) => {
    let cc = readFileSync(
        resolve(process.cwd(), ".dotbuild", "command"),
        "utf-8"
    );
    cc = cc.replace(/(\r\n|\n|\r)/gm, "");

    console.log(
        `\n   ${chalk.redBright.bold(
            "ERROR"
        )} An error occurred while running command ["${cc
            .split(" ")
            .join('", "')}"]:`
    );
    console.log(
        `\n\t`,
        isUnhandledRej
            ? err.toString().replace(/\n/g, "\n\t ")
            : err.message.replace(/\n/g, "\n\t ")
    );
    if (err.stack || isUnhandledRej) {
        const stack: any = err.stack?.split("\n");
        stack.shift();
        stack.shift();
        console.log(
            `\t`,
            stack
                .join("\n")
                .replace(/(\r\n|\n|\r)/gm, "")
                .replace(/    at /g, "\n\t • ")
        );
    }

    console.log();
    log.info("Exiting due to error.");
    process.exit(1);
};
