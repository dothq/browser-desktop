import axios from "axios";
import chalk from "chalk";
import { createWriteStream } from "fs";
import { basename } from "path";
import { createProgress } from "./progress";
import { sleep } from "./sleep";

export const multipartGet = async (url: string, outfile: string) => {
	return new Promise(async (resolve) => {
		const pathname = basename(url);
		const progress = createProgress("info", {
			text: `Starting download of ${pathname}... ${chalk.dim(`(00%)`)}`,
		});

		const writable = createWriteStream(outfile);

		progress.start();

		await sleep(2000);

		let receivedBytes = 0;

		axios.get(url, { responseType: "stream" }).then((res) => {
			const stream = res.data;

			stream.on("data", (chunk: any) => {
				receivedBytes += chunk.length;

				const percentCompleted = parseInt(
					Math.round(
						(receivedBytes * 100) /
							parseInt(res.headers["content-length"] as string)
					).toFixed(0)
				)
					.toString()
					.padStart(2, "0");

				progress.text = `Starting download of ${pathname}... ${chalk.dim(
					`(${percentCompleted}%)`
				)}`;

				const buffer = Buffer.from(chunk);
				writable.write(buffer);
			});

			stream.on("error", () => {
				progress.end();
				resolve(true);
			});

			stream.on("end", () => {
				progress.end();
				writable.end();
				resolve(true);
			});
		});
	});
};
