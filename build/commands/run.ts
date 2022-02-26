import { Melon } from "..";
import { engineDir } from "../utils/path";
import { $$ } from "../utils/sh";

export class RunCommand {
    public name = "run";
    public description = "Runs Dot Browser.";

    public aliases = [
        "r"
    ]

    public async exec(cli: Melon) {
        await $$({ cwd: engineDir })`./mach run ${process.argv.splice(3)}`;
    }
}