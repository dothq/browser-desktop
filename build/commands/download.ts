import { path7za } from "7zip-bin";
import chalk from "chalk";
import fs, { existsSync } from "fs";
import { appendFile, ensureDirSync, move } from "fs-extra";
import git from "isomorphic-git";
import { extract, extractFull } from "node-7z";
import { tmpdir } from "os";
import { resolve } from "path";
import rimraf from "rimraf";
import { Melon } from "..";
import { makeExecutable } from "../utils/executable";
import { setConfig } from "../utils/git";
import { multipartGet } from "../utils/http";
import { engineDir } from "../utils/path";
import { createProgress } from "../utils/progress";
import { $$ } from "../utils/sh";

export class DownloadCommand {
    public name = "download";
    public description = "Get the Dot Browser project set-up."

    public aliases = [
        "download",
        "get",
        "install"
    ];

    public async exec(cli: Melon) {
        const melonCache = resolve(tmpdir(), "melonbuild");

        ensureDirSync(melonCache);

        const archivePath = resolve(melonCache, `firefox-${cli.versions.firefox}.tar.xz`);
        const archiveTarPath = resolve(melonCache, `firefox-${cli.versions.firefox}.tar`);
        const archiveDecompressPath = resolve(melonCache, `firefox-${cli.versions.firefox}`);
        const outPath = engineDir;

        if(existsSync(outPath)) {
            const result = await cli.yesno("A project is already setup at \`engine\`, would you like to delete it?");

            if(result) {
                cli.info(`Removing engine directory...`);
                rimraf.sync(outPath);
            } else {
                process.exit(0);
            }
        }

        if(!existsSync(archivePath)) {
            await multipartGet(
                `https://archive.mozilla.org/pub/firefox/releases/${cli.versions.firefox}/source/firefox-${cli.versions.firefox}.source.tar.xz`,
                archivePath
            );
        }

        if(
            existsSync(archiveTarPath) ||
            existsSync(archiveDecompressPath)
        ) {
            cli.info(`Cleaning up left over cache...`);
            rimraf.sync(archiveTarPath);
            rimraf.sync(archiveDecompressPath);
        }

        const sevenPath = resolve(
            process.cwd(), 
            "node_modules", 
            "7zip-bin", 
            ...path7za
                .split(__dirname)[1]
                .split(process.platform == "win32" ? "\\" : "/")
        )

        const tar = extract(archivePath, resolve(tmpdir(), "melonbuild"), {
            recursive: true,
            $progress: true,
            $bin: sevenPath
        });

        const unpackProgress = createProgress("info", { text: `Unpacking to engine...` });
        unpackProgress.start();

        let tarFile = "";
        let xzPercent = 0;
        let tarPercent = 0;

        tar.on("progress", (progress) => {
            xzPercent = progress.percent / 2
            unpackProgress.text = `Unpacking to engine... ${chalk.dim(`(${Math.min((xzPercent + tarPercent), 100).toFixed(0).toString().padStart(2, "0")}%)`)}`
        })

        tar.on("data", (data) => {
            tarFile = data.file;
        })

        tar.on("error", () => {})

        tar.on("end", async () => {
            const path = resolve(tmpdir(), "melonbuild", tarFile);
            const extractPath = resolve(tmpdir(), "melonbuild");

            if(existsSync(path)) {
                await git.init({ fs, dir: archiveDecompressPath });
                await setConfig(archiveDecompressPath,
                    "core.autocrlf",
                    false
                );
                $$({ cwd: archiveDecompressPath, shutUp: true })`git checkout --orphan ff`

                const stream = extractFull(path, extractPath, {
                    $bin: sevenPath,
                    $progress: true,
                    recursive: true
                });

                stream.on("data", async (data) => {
                    if(data.status !== "extracted") return;
                    
                    const filepath = data.file.split(`firefox-${cli.versions.firefox}/`)[1];

                    if(filepath && filepath.length && existsSync(resolve(extractPath, data.file))) {
                        try {
                            git.add({ 
                                fs, 
                                dir: resolve(extractPath, `firefox-${cli.versions.firefox}`), 
                                filepath
                            }).catch(e => {})
                        } catch(e) {}
                    }
                })

                stream.on("progress", async (progress) => {
                    tarPercent = progress.percent / 2
                    unpackProgress.text = `Unpacking to engine... ${chalk.dim(`(${Math.min((xzPercent + tarPercent), 100).toFixed(0).toString().padStart(2, "0")}%)`)}`
                })

                stream.on("end", async () => {
                    rimraf.sync(archiveTarPath);
                    
                    await move(resolve(extractPath, `firefox-${cli.versions.firefox}`), outPath);
                    
                    unpackProgress.end();
                    
                    cli.info(`Setting up Git...`)
                    await $$({ cwd: engineDir, stream: true })`git add . -v`;
                    await $$({ cwd: engineDir, stream: true })`git commit -m "Initial commit"`;
                    await $$({ cwd: engineDir })`git checkout -b dot`;

                    await makeExecutable();

                    cli.success(`Congratulations, Dot Browser for Desktop is now ready for building.`);
                    process.exit(0);
                })
            } else {
                cli.error(`Failed to unpack ${path} to engine.`)
            }
        })
    }
}