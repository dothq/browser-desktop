/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {
    existsSync,
    readFileSync,
    writeFileSync
} from "fs";
import { lookpath } from "lookpath";
import { resolve } from "path";
import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import { commands } from "./commands";
import { errorHandler } from "./utils/error";
import {
    error,
    info,
    success,
    warning,
    yesno
} from "./utils/log";
import { $, $$ } from "./utils/sh";
import { readableTime } from "./utils/time";

export class Melon {
    public yargs;

    public info = info;
    public warning = warning;
    public success = success;
    public error = error;
    public yesno = yesno;

    public version = "0.0.0";
    public nodePackageManager = "npm";

    public get versions(): {
        dot: string;
        firefox: string;
        "firefox-display": string;
        melon: string;
    } {
        return require("../package.json").versions;
    }

    public async init() {
        this.version = require("../package.json").version;
        this.nodePackageManager = (await lookpath("yarn"))
            ? "yarn"
            : "npm";
    }

    public getVersionString() {
        const ln: any[] = [];

        const versionNameBinding: any = {
            "Dot Browser": ["dot"],
            Gecko: ["firefox", "firefox-display"],
            Melon: ["melon"]
        };

        for (const [key, value] of Object.entries(
            this.versions
        )) {
            const name = (
                Object.entries(versionNameBinding).find(
                    (i: any) => i[1].includes(key)
                ) as any
            )[0];
            const text = `\n\t${name}: ${value}`;

            if (!ln.includes(text)) {
                ln.push(text);
            }
        }

        ln.push("\n");
        return ln.join("");
    }

    public registerCommands() {
        for (const cmd of commands) {
            const Command = new cmd() as any;

            this.yargs.command({
                command: Command.name,
                aliases: Command.aliases
                    ? Command.aliases.filter(
                          (i: any) => i !== Command.name
                      )
                    : [],
                description: Command.description,
                handler: async (args: any) => {
                    process.env.MOZ_SOURCE_CHANGESET = (
                        await $$({
                            shutUp: true
                        })`git rev-parse HEAD`
                    ).data;
                    process.env.__MELON__ = "1";
                    process.env.MOZBUILD_STATE_PATH =
                        resolve(
                            process.cwd(),
                            ".melon",
                            "mozbuild"
                        );
                    process.env.FORCE_COLOR = "1";

                    try {
                        return await Command.exec(
                            this,
                            ...Object.values(args).slice(
                                2
                            )
                        );
                    } catch (e) {
                        if ("onBeforeError" in Command)
                            Command.onBeforeError(e);
                        throw e;
                    }
                }
            } as any);

            if ("aliases" in Command) {
                for (const alias in Command.aliases) {
                    this.yargs.alias(Command.name, alias);
                }
            }
        }
    }

    public maybeShowDeprecation() {
        if (
            existsSync(
                resolve(process.cwd(), ".dotbuild")
            )
        ) {
            this.warning(
                `We detected you are using the old version of Melon, the build system for Dot Browser.`
            );
            this.warning(
                `The new version has been reworked to function correctly on Windows, macOS and Linux.`
            );
            this.warning(``);
            this.warning(
                `You have been automatically upgraded - however, please be aware you may run into issues`
            );
            this.warning(
                `since the project was setup on the older version.`
            );
            this.warning(``);
            this.warning(
                `If you run into any problems it may be easier to just reclone the repository and resetup`
            );
            this.warning(`the project.`);
            this.warning(``);
            this.warning(
                `To hide this warning, delete the \`.dotbuild\` directory. Your IDE may hide this directory`
            );
            this.warning(
                `so just delete it from the terminal instead.`
            );
        }
    }

    public maybeMakeMozconfig() {
        if (
            !existsSync(
                resolve(process.cwd(), "mozconfig")
            )
        ) {
            writeFileSync(
                resolve(process.cwd(), "mozconfig"),
                `# Add custom mozbuild options here`
            );
        }
    }

    public constructor() {
        const args = hideBin(process.argv);

        this.maybeShowDeprecation();
        this.maybeMakeMozconfig();

        this.yargs = yargs(args)
            .scriptName("melon")
            .usage("$0 <command> [arguments]")
            .demandCommand()
            .recommendCommands()
            .help()
            .option("yes", {
                description: "Say yes to all questions",
                type: "boolean"
            });

        this.registerCommands();

        // All commands need to go before this
        this.yargs.command({
            command: "*",
            handler: () => {
                this.yargs.showHelp();
            }
        });

        this.yargs.version(this.getVersionString());

        this.init();
    }
}

process.on("uncaughtException", errorHandler);
process.on("unhandledException", (err) =>
    errorHandler(err)
);
process.on("unhandledRejection", (err) =>
    errorHandler(err as any, true)
);

export const cli = new Melon();
cli.yargs.argv;
