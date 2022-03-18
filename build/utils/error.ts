import chalk from "chalk";
import { hideBin } from "yargs/helpers";
import { info } from "./log";

export const errorHandler = (err: Error, isUnhandledRej?: boolean) => {
	const cmd = hideBin(process.argv);

	console.log(
		`\n${chalk.redBright.bold(
			"error"
		)} An error occurred while running command ["${cmd.join('", "')}"]:`
	);
	console.log(
		`\n     `,
		isUnhandledRej
			? err.toString().replace(/\n/g, "\n")
			: err.message.replace(/\n/g, "\n")
	);
	if (err.stack || isUnhandledRej) {
		const stack: any = err.stack?.split("\n");
		stack.shift();
		console.log(
			`\t`,
			stack
				.join("\n")
				.replace(/(\r\n|\n|\r)/gm, "")
				.replace(/    /g, "\n      • ")
		);
	}

	const json = JSON.parse(JSON.stringify(err));
	delete json.stack;
	delete json.message;

	console.log("\n      Raw:", JSON.stringify(json));

	console.log();
	info("Exiting due to error.");
	process.exit(1);
};
