import chalk from "chalk";
import { existsSync, readdirSync } from "fs-extra";
import { basename, resolve } from "path";
import { hideBin } from "yargs/helpers";
import { info, lightError } from "../utils/log";
import { engineDir, patchesDir } from "../utils/path";
import { createProgress } from "../utils/progress";
import { $$ } from "../utils/sh";
import { sleep } from "../utils/sleep";

export const importDotPatches = async () => {
	if (!existsSync(patchesDir)) {
		lightError(`No patches directory.`);
		return;
	}

	const args = hideBin(process.argv);

	const patches = readdirSync(patchesDir)
		.filter((f) => f.endsWith(".patch"))
		.map((f) => resolve(patchesDir, f));

	info(`Applied patches:`);

	for await (const patch of patches) {
		const progress = createProgress("none");

		const spinner = ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"];

		let result = spinner;
		let index = 0;

		const tick = () => {
			index = index >= result.length - 1 ? 0 : index + 1;

			progress.text = `    • ${basename(patch)} ${result[index]}\n`;
		};

		tick();
		progress.start();

		let int = setInterval(() => tick(), 50);

		const { code } = await $$({
			cwd: engineDir,
			shutUp: true,
			noErrorKill: true,
		})`git apply -R --check ${patch}`;

		let doneEmoji = "";
		let error = "";

		if (code !== 0 || args.includes("--force")) {
			const { code, data } = await $$({
				cwd: engineDir,
				shutUp: true,
				noErrorKill: true,
				writeErrorToData: true,
			})`git apply -v ${patch}`;

			doneEmoji = code == 0 ? "✅" : "🛑";
			error = data;
		} else {
			doneEmoji = "⏭";
		}

		await sleep(500);
		clearInterval(int);

		progress.text = `     • ${basename(patch)} ${doneEmoji}`;
		progress.end();

		if (error && error.length) {
			for (const ln of error
				.split("\n")
				.map((ln) => "        • " + chalk.redBright(ln))) {
				console.log(ln);
			}

			process.exit(1);
		}
	}
};
