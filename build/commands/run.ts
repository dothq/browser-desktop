import { existsSync } from "fs-extra";
import { resolve } from "path";
import { Melon } from "..";
import { error } from "../utils/log";
import { engineDir } from "../utils/path";
import { $$ } from "../utils/sh";

export class RunCommand {
	public name = "run";
	public description = "Runs Dot Browser.";

	public aliases = ["r"];

	public async exec(cli: Melon) {
		if (!existsSync(resolve(process.cwd(), "src", "dist", "browser.js"))) {
			return error(
				"No targets found to run. You will need to build using ./melon build before running this."
			);
		}

		await $$({
			cwd: engineDir,
		})`./mach run ${process.argv.splice(3)}`;
	}
}
