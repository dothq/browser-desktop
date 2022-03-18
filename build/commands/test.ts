import { Melon } from "..";
import { error, info, success, warning } from "../utils/log";
import { runNPMScript } from "../utils/npm";
import { RunCommand } from "./run";
import express from "express";
import { createServer } from "http";
import { WebSocketServer } from "ws";
import { resolve } from "path";
import { srcDir } from "../utils/path";
import { appendFileSync, readFileSync, writeFileSync } from "fs";
import { build } from "esbuild";

let script: string = "";

export class TestCommand {
	public name = "test";
	public description = "Run interface tests.";

	public aliases = ["t"];

	public connectionInt: NodeJS.Timeout | undefined;

	public async exec(cli: Melon) {
		await runNPMScript("i");
		await runNPMScript("lint");
		await runNPMScript("build");

		const testing = await build({
			entryPoints: {
				"browser-testing": resolve(
					srcDir,
					"components",
					"testing",
					"index.ts"
				),
			},
			sourceRoot: srcDir,
			bundle: true,
			target: "firefox90",
			outdir: resolve(srcDir, "dist"),
			write: false,
		});

		const output = String.fromCharCode(...testing.outputFiles[0].contents);
		const lns = output.split("\n").filter((ln) => ln.length);
		lns.shift();
		lns.pop();

		script = `<script>${lns.join("\n")}</script>`;

		appendFileSync(resolve(srcDir, "dist", "browser.html"), script);

		const http = createServer();
		const io = new WebSocketServer({ server: http });
		http.listen(46943); // Don't change this.

		info("Waiting for a connection...");

		io.on("connection", (socket) => {
			if (io.clients.size <= 1) {
				success("Connected!");

				socket.on("message", (data: any) => {
					const parsed = JSON.parse(data);

					const type = `${parsed.type}`;
					delete parsed.type;

					console.log(
						`-> Received event type=${type} data=${parsed}`
					);
				});
			} else {
				socket.close();
				warning("You're already connected to the socket.");
			}
		});

		process.on("beforeExit", () => {
			this.onBeforeError();
		});

		new RunCommand().exec(cli);
	}

	public onBeforeError() {
		writeFileSync(
			resolve(srcDir, "dist", "browser.html"),
			readFileSync(
				resolve(srcDir, "dist", "browser.html"),
				"utf-8"
			).replace(script, "")
		);
	}
}
