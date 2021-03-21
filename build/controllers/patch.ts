import chalk from "chalk";
import { ensureDirSync, statSync } from "fs-extra";
import { resolve } from "path";
import { log } from "..";
import { PATCHES_DIR } from "../constants";
import { copyManual } from "../utils";

class Patch {
    public name: string;
    public action: string;
    public src: string | string[];
    public type: "file" | "manual";
    private _done: boolean = false;

    private async applyAsManual() {
        return new Promise(async (res) => {
            switch (this.action) {
                case "copy":
                    if (typeof this.src == "string")
                        copyManual(this.src);

                    if (Array.isArray(this.src)) {
                        this.src.forEach((i) => {
                            if (
                                statSync(i).isDirectory()
                            ) {
                                ensureDirSync(i);
                            }

                            copyManual(i);
                        });
                    }

                    res(true);
            }
        });
    }

    public async apply() {
        log.info(`Applying ${this.name}...`);

        this.type == "manual" &&
            (await this.applyAsManual());

        this.done = true;
    }

    public get done() {
        return this._done;
    }

    public set done(_: any) {
        this._done = true;

        process.stdout.moveCursor(0, -1);
        process.stdout.clearLine(1);

        log.info(
            `Applying ${this.name}... ${chalk.green.bold(
                "Done ✔"
            )}`
        );
    }

    constructor({
        name,
        action,
        src,
        type
    }: {
        name: string;
        action?: string;
        src?: string | string[];
        type: "file" | "manual";
    }) {
        this.name = name;
        this.action = action || "";
        this.src = src || resolve(PATCHES_DIR, name);
        this.type = type;
    }
}

export default Patch;
