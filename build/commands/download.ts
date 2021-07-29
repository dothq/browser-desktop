import axios from "axios";
import chalk from "chalk";
import execa from "execa";
import fs, {
    existsSync,
    rmdirSync,
    writeFileSync
} from "fs";
import { ensureDirSync, removeSync } from "fs-extra";
import ora from "ora";
import { homedir } from "os";
import { posix, resolve, sep } from "path";
import { bin_name, log } from "..";
import { ENGINE_DIR } from "../constants";
import { getLatestFF, writeMetadata } from "../utils";
import { downloadArtifacts } from "./download-artifacts";

const pjson = require("../../package.json");

let initProgressText = "Initialising...";
let initProgress: any = ora({
    text: `Initialising...`,
    prefixText: chalk.blueBright.bold("00:00:00"),
    spinner: {
        frames: [""]
    },
    indent: 0
});

const onData = (data: any) => {
    const d = data.toString();

    d.split("\n").forEach((line: any) => {
        if (line.trim().length !== 0) {
            let t = line.split(" ");
            t.shift();
            initProgressText = t.join(" ");
        }
    });
};

const unpack = async (name: string, version: string) => {
    let cwd = process.cwd().split(sep).join(posix.sep);

    if (process.platform == "win32") {
        cwd = "./";
    }

    initProgress.start();

    setInterval(() => {
        if (initProgress) {
            initProgress.text = initProgressText;
            initProgress.prefixText =
                chalk.blueBright.bold(log.getDiff());
        }
    }, 100);

    initProgressText = `Unpacking Firefox...`;

    try {
        rmdirSync(ENGINE_DIR);
    } catch (e) {}
    ensureDirSync(ENGINE_DIR);

    let tarProc = execa("tar", [
        "--transform",
        "s,firefox-89.0,engine,",
        `--show-transformed`,
        "-xf",
        resolve(cwd, ".dotbuild", "engines", name)
    ]);

    (tarProc.stdout as any).on("data", onData);
    (tarProc.stdout as any).on("error", onData);

    tarProc.on("exit", () => {
        if (process.env.CI_SKIP_INIT)
            return log.info("Skipping initialisation.");

        const initProc = execa(`./${bin_name}`, [
            "init",
            "engine"
        ]);

        (initProc.stdout as any).on("data", onData);
        (initProc.stdout as any).on("error", onData);

        initProc.on("exit", async () => {
            initProgressText = "";
            initProgress.stop();
            initProgress = null;

            await new Promise((resolve) =>
                setTimeout(resolve, 5000)
            );

            log.success(
                `You should be ready to make changes to Dot Browser.\n\n\t   You should import the patches next, run |${bin_name} import|.\n\t   To begin building Dot, run |${bin_name} build|.`
            );
            console.log();

            pjson.versions["firefox-display"] = version;
            pjson.versions["firefox"] =
                version.split("b")[0];

            writeFileSync(
                resolve(process.cwd(), "package.json"),
                JSON.stringify(pjson, null, 4)
            );

            await writeMetadata();

            removeSync(
                resolve(cwd, ".dotbuild", "engines", name)
            );

            process.exit(0);
        });
    });
};

export const download = async (
    firefoxVersion?: string
) => {
    if (firefoxVersion)
        log.warning(
            `A custom Firefox version is being used. Some features of Dot may not work as expected.`
        );

    if (!firefoxVersion) {
        firefoxVersion =
            pjson.versions["firefox-display"];
    }

    let version = await getLatestFF();

    if (firefoxVersion) {
        version = firefoxVersion;
    }

    const base = `https://archive.mozilla.org/pub/firefox/releases/${version}/source/`;
    const filename = `firefox-${version}.source.tar.xz`;

    const url = `${base}${filename}`;

    log.info(`Locating Firefox release ${version}...`);

    ensureDirSync(
        resolve(process.cwd(), `.dotbuild`, `engines`)
    );

    if (
        existsSync(
            resolve(
                process.cwd(),
                `.dotbuild`,
                `engines`,
                `firefox-${version.split("b")[0]}`
            )
        )
    ) {
        log.error(
            `Cannot download version ${
                version.split("b")[0]
            } as it already exists at "${resolve(
                process.cwd(),
                `firefox-${version.split("b")[0]}`
            )}"`
        );
    }

    if (version == firefoxVersion)
        log.info(
            `Version is frozen at ${firefoxVersion}!`
        );
    if (version.includes("b"))
        log.warning(
            "Version includes non-numeric characters. This is probably a beta."
        );

    if (
        fs.existsSync(
            resolve(
                process.cwd(),
                `.dotbuild`,
                `engines`,
                "firefox",
                version.split("b")[0]
            )
        ) ||
        fs.existsSync(
            resolve(
                process.cwd(),
                "firefox",
                "firefox-" + version.split("b")[0]
            )
        )
    )
        log.error(
            `Workspace with version "${
                version.split("b")[0]
            }" already exists.\nRemove that workspace and run |${bin_name} download ${version}| again.`
        );

    log.info(`Downloading Firefox release ${version}...`);

    const { data, headers } = await axios.get(url, {
        responseType: "stream"
    });

    const length = headers["content-length"];

    const writer = fs.createWriteStream(
        resolve(
            process.cwd(),
            `.dotbuild`,
            `engines`,
            filename
        )
    );

    let receivedBytes = 0;

    data.on("data", (chunk: any) => {
        receivedBytes += chunk.length;

        let rand = Math.floor(Math.random() * 1000 + 1);

        if (rand > 999.5) {
            let percentCompleted = parseInt(
                Math.round(
                    (receivedBytes * 100) / length
                ).toFixed(0)
            );
            if (
                percentCompleted % 2 == 0 ||
                percentCompleted >= 100
            )
                return;
            log.info(
                `\t${filename}\t${percentCompleted}%...`
            );
        }
    });

    data.pipe(writer);

    data.on("end", async () => {
        await unpack(filename, version);

        if (process.platform === "win32") {
            if (
                existsSync(
                    resolve(homedir(), ".mozbuild")
                )
            ) {
                log.info(
                    "Mozbuild directory already exists, not redownloading"
                );
            } else {
                log.info(
                    "Mozbuild not found, downloading artifacts."
                );
                await downloadArtifacts();
            }
        }
    });
};
