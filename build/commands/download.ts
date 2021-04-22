import axios from "axios";
import execa from "execa";
import fs, {
    appendFileSync,
    existsSync,
    writeFileSync
} from "fs";
import { moveSync, removeSync } from "fs-extra";
import { homedir } from "os";
import { posix, resolve, sep } from "path";
import { bin_name, log } from "..";
import { writeMetadata } from "../utils";
import { downloadArtifacts } from "./download-artifacts";

const pjson = require("../../package.json");

const unpack = async (name: string, version: string) => {
    let cwd = process.cwd().split(sep).join(posix.sep);

    if (process.platform == "win32") {
        cwd = "./";
    }

    log.info(`Unpacking Firefox...`);
    await execa("tar", ["-xvf", name, "-C", cwd]);

    moveSync(
        resolve(cwd, `firefox-${version.split("b")[0]}`),
        resolve(cwd, "src"),
        { overwrite: true }
    );

    appendFileSync(
        resolve(cwd, "src", ".gitignore"),
        "\n\n# Imported files"
    );

    appendFileSync(
        resolve(cwd, "src", ".gitignore"),
        "*.rej"
    );

    if (process.env.CI_SKIP_INIT)
        return log.info("Skipping initialisation.");

    const proc = execa(`./${bin_name}`, ["init", "src"]);

    (proc.stdout as any).on("data", (data: any) => {
        const d = data.toString();

        d.split("\n").forEach((line: any) => {
            if (line.length !== 0) {
                let t = line.split(" ");
                t.shift();
                log.info(t.join(" "));
            }
        });
    });

    (proc.stdout as any).on("error", (data: any) => {
        const d = data.toString();

        d.split("\n").forEach((line: any) => {
            if (line.length !== 0) {
                let t = line.split(" ");
                t.shift();
                log.info(t.join(" "));
            }
        });
    });

    proc.on("exit", async () => {
        log.success(
            `You should be ready to make changes to Dot Browser.\n\n\t   You should import the patches next, run |${bin_name} import|.\n\t   To begin building Dot, run |${bin_name} build|.`
        );
        console.log();

        pjson.versions["firefox-display"] = version;
        pjson.versions["firefox"] = version.split("b")[0];

        writeFileSync(
            resolve(process.cwd(), "package.json"),
            JSON.stringify(pjson, null, 2)
        );

        await writeMetadata();

        removeSync(name);
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

    const res = await axios.head(
        `https://download.mozilla.org/?product=firefox-latest-ssl&os=linux64&lang=en-US`
    );

    let version = res.request.path
        .replace("/pub/firefox/releases/", "")
        .split("/")[0];

    if (firefoxVersion) {
        if (version !== firefoxVersion)
            log.warning(
                `Latest version of Firefox (${version}) does not match frozen version (${firefoxVersion}).`
            );
        version = firefoxVersion;
    }

    const base = `https://archive.mozilla.org/pub/firefox/releases/${version}/source/`;
    const filename = `firefox-${version}.source.tar.xz`;

    const url = `${base}${filename}`;

    log.info(`Locating Firefox release ${version}...`);

    if (
        existsSync(
            resolve(
                process.cwd(),
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
        resolve(process.cwd(), filename)
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
