/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const { fork } = require("child_process");
const { build } = require("esbuild");
const execa = require("execa");
const { writeFileSync, readFileSync, existsSync } = require("fs");
const { lookpath } = require("lookpath");
const { resolve } = require("path");
const { createHash } = require("crypto");
const { ensureDirSync } = require("fs-extra");

const useNodePkgMgr = () => {
	const yarnExists = lookpath("yarn");

	return yarnExists ? "yarn" : "npm";
};

const genHashOfPackageJson = () => {
	const pkgLock = createHash("sha1");
	pkgLock.update(
		readFileSync(resolve(process.cwd(), "package.json"), "utf-8")
	);

	return pkgLock.digest("hex");
};

const canInstallDeps = () => {
	const lockPath = resolve(process.cwd(), ".melon", "LOCK");

	if (existsSync(lockPath)) {
		const lockHash = readFileSync(lockPath, "utf-8");
		const currentHash = genHashOfPackageJson();

		if (lockHash == currentHash) {
			return false;
		} else {
			writeFileSync(lockPath, currentHash);
			return true;
		}
	} else {
		writeFileSync(lockPath, genHashOfPackageJson());
		return true;
	}
};

const installDependencies = async () => {
	return new Promise((resolve) => {
		if (!canInstallDeps()) return resolve(true);

		const mgr = useNodePkgMgr();

		const installProcess = execa(mgr, ["install"]);
		installProcess.stdout.pipe(process.stdout);

		installProcess.on("exit", (code) => {
			resolve(code == 0 ? true : false);
		});
	});
};

const main = async () => {
	ensureDirSync(resolve(process.cwd(), ".melon"));

	let timeout = setTimeout(() => {
		console.log(
			"Melon is taking longer than expected. It is still working so give it some time before killing."
		);
	}, 5000);

	process.env["FORCE_COLOR"] = "true";

	await installDependencies();

	build({
		entryPoints: [resolve(process.cwd(), "build", "index.ts")],
		bundle: true,
		target: "node16",
		platform: "node",
		sourcemap: true,
		external: ["bsdiff-node", "esbuild"],
		outdir: resolve(process.cwd(), ".melon"),
	})
		.then((_) => {
			const proc = fork(
				resolve(process.cwd(), ".melon", "index.js"),
				process.argv.splice(2),
				{ stdio: "inherit" }
			);

			proc.on("exit", (code) => {
				process.exit(code);
			});
		})
		.finally(() => {
			clearTimeout(timeout);
		});
};

main();
