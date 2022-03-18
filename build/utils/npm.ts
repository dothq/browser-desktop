import { resolve } from "path";
import { readFileSync } from "fs-extra";
import { lightError } from "./log";
import { srcDir, engineDir } from "./path";
import { $$ } from "./sh";
import { Options } from "execa";

export const runNPMScript = async (name: any, options?: Options) => {
	const { scripts } = JSON.parse(
		readFileSync(resolve(srcDir, "package.json"), "utf-8")
	) as Record<string, string>;

	const script = scripts[name];
	if (!script) return lightError(`No script found with name \`${name}\`.`);

	await $$({
		cwd: resolve(engineDir, "dot"),
	})`${script}`;
};
