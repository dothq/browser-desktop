import chalk from "chalk";
import execa from "execa";
import {
    ensureDirSync,
    existsSync,
    rmdirSync,
    rmSync,
    statSync
} from "fs-extra";
import { resolve } from "path";
import readline from "readline";
import { log } from "..";
import {
    BROWSER_DIR,
    COMMON_DIR,
    PATCH_ARGS,
    SRC_DIR
} from "../constants";
import { copyManual } from "../utils";

class Patch {
    public name: string;
    public action: string;
    public src: string | string[];
    public type: "file" | "manual";
    public status: number[];
    public markers?: {
        [key: string]: [string, string];
    };
    public indent?: number;
    public options: {
        minimal?: boolean;
        noIgnore?: boolean;
    };
    private _done: boolean = false;

    private error: Error | unknown;

    private async applyAsManual() {
        return new Promise(async (res, rej) => {
            try {
                switch (this.action) {
                    case "copy":
                        if (typeof this.src == "string") {
                            if (
                                !existsSync(
                                    resolve(
                                        COMMON_DIR,
                                        this.src
                                    )
                                )
                            )
                                return log.error(
                                    `We were unable to copy the file or directory \`${this.src}\` as it doesn't exist in the common directory.`
                                );

                            copyManual(
                                this.src,
                                this.options.noIgnore
                            );
                        }

                        if (Array.isArray(this.src)) {
                            this.src.forEach((i) => {
                                if (
                                    !existsSync(
                                        resolve(
                                            COMMON_DIR,
                                            i
                                        )
                                    )
                                )
                                    return log.error(
                                        `We were unable to copy the file or directory \`${i}\` as it doesn't exist in the common directory.`
                                    );

                                if (
                                    statSync(
                                        resolve(
                                            COMMON_DIR,
                                            i
                                        )
                                    ).isDirectory()
                                ) {
                                    ensureDirSync(
                                        resolve(
                                            COMMON_DIR,
                                            i
                                        )
                                    );
                                }

                                copyManual(
                                    i,
                                    this.options.noIgnore
                                );
                            });
                        }

                        break;
                    case "delete":
                        if (typeof this.src == "string") {
                            if (
                                !existsSync(
                                    resolve(
                                        SRC_DIR,
                                        this.src
                                    )
                                )
                            )
                                return log.error(
                                    `We were unable to delete the file or directory \`${this.src}\` as it doesn't exist in the src directory.`
                                );

                            if (
                                statSync(
                                    resolve(
                                        SRC_DIR,
                                        this.src
                                    )
                                ).isDirectory()
                            ) {
                                rmdirSync(
                                    resolve(
                                        SRC_DIR,
                                        this.src
                                    )
                                );
                            } else {
                                rmSync(
                                    resolve(
                                        SRC_DIR,
                                        this.src
                                    )
                                );
                            }
                        }

                        if (Array.isArray(this.src)) {
                            this.src.forEach((i) => {
                                if (
                                    !existsSync(
                                        resolve(
                                            SRC_DIR,
                                            i
                                        )
                                    )
                                )
                                    return log.error(
                                        `We were unable to delete the file or directory \`${i}\` as it doesn't exist in the src directory.`
                                    );

                                if (
                                    statSync(
                                        resolve(
                                            SRC_DIR,
                                            i
                                        )
                                    ).isDirectory()
                                ) {
                                    rmdirSync(
                                        resolve(
                                            SRC_DIR,
                                            i
                                        )
                                    );
                                } else {
                                    rmSync(
                                        resolve(
                                            SRC_DIR,
                                            i
                                        ),
                                        { force: true }
                                    );
                                }
                            });
                        }

                        break;
                }

                res(true);
            } catch (e) {
                rej(e);
            }
        });
    }

    private async applyAsPatch() {
        return new Promise(async (res, rej) => {
            try {
                try {
                    await execa(
                        "git",
                        [
                            "apply",
                            "-R",
                            ...PATCH_ARGS,
                            this.src as any
                        ],
                        { cwd: SRC_DIR }
                    );
                } catch (e) {
                    null;
                }

                const { stdout, exitCode } = await execa(
                    "git",
                    [
                        "apply",
                        ...PATCH_ARGS,
                        this.src as any
                    ],
                    { cwd: SRC_DIR }
                );

                if (exitCode == 0) res(true);
                else throw stdout;
            } catch (e) {
                rej(e);
            }
        });
    }

    public async apply() {
        if (!this.options.minimal) {
            log.info(
                `${chalk.gray(
                    `(${this.status[0]}/${this.status[1]})`
                )} Applying ${this.name}...`
            );
        }

        try {
            if (this.type == "manual")
                await this.applyAsManual();
            if (this.type == "file")
                await this.applyAsPatch();

            this.done = true;
        } catch (e) {
            this.error = e;
            this.done = false;
        }
    }

    public get done() {
        return this._done;
    }

    public set done(_: any) {
        this._done = _;

        if (!this.options.minimal) {
            readline.moveCursor(process.stdout, 0, -1);
            readline.clearLine(process.stdout, 1);

            log.info(
                `${chalk.gray(
                    `(${this.status[0]}/${this.status[1]})`
                )} Applying ${this.name}... ${chalk[
                    this._done ? "green" : "red"
                ].bold(
                    this._done ? "Done ✔" : "Error ❗"
                )}`
            );
        }

        if (this.error) {
            throw this.error;
        }
    }

    constructor({
        name,
        action,
        src,
        type,
        status,
        markers,
        indent,
        options
    }: {
        name: string;
        action?: string;
        src?: string | string[];
        type: "file" | "manual";
        status: number[];
        markers?: {
            [key: string]: [string, string];
        };
        indent?: number;
        options: {
            minimal?: boolean;
            noIgnore?: boolean;
        };
    }) {
        this.name = name;
        this.action = action || "";
        this.src = src || resolve(BROWSER_DIR, name);
        this.type = type;
        this.status = status;
        this.markers = markers;
        this.indent = indent;
        this.options = options;
    }
}

export default Patch;
