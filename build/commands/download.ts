import axios from 'axios';
import { bin_name, log } from '..';
import fs, { existsSync, symlinkSync, writeFileSync } from 'fs';
import { resolve } from 'path';
import execa from 'execa';
import { dispatch } from '../dispatch';

const pjson = require("../../package.json");

const unpack = async (name: string, version: string) => {
    log.info(`Cleaning up symlinks...`)
    await execa("rm", ["-rf", resolve(process.cwd(), `firefox`)]);

    log.info(`Unpacking Firefox...`);
    await execa("tar", ["-xvf", name, "-C", process.cwd()]);

    await execa("mv", [`firefox-${version.split("b")[0]}`, `firefox`])

    const proc = execa(`./${bin_name}`, ["init", "firefox"]);

    (proc.stdout as any).on('data', (data: any) => {
        const d = data.toString();

        d.split("\n").forEach((line: any) => {
            if(line.length !== 0) log.info(line)
        });
    });

    (proc.stdout as any).on('error', (data: any) => {
        const d = data.toString();

        d.split("\n").forEach((line: any) => {
            if(line.length !== 0) log.info(line)
        });
    });

    proc.on('exit', () => {
        log.success(`You should be ready to make changes to Dot Browser.\n\n\t   To begin building Dot, run |${bin_name} build|.`)
        console.log()
    
        pjson.versions["firefox-display"] = version;
        pjson.versions["firefox"] = version.split("b")[0];
    
        writeFileSync(resolve(process.cwd(), "package.json"), JSON.stringify(pjson, null, 2))
    })
}

export const download = async () => {
    const firefoxVersion = pjson.versions["firefox-display"];

    const res = await axios.head(`https://download.mozilla.org/?product=firefox-latest-ssl&os=linux64&lang=en-US`)

    let version = res.request.path.replace("/pub/firefox/releases/", "").split("/")[0]

    if(firefoxVersion) {
        if(version !== firefoxVersion) log.warning(`Latest version of Firefox (${version}) does not match frozen version (${firefoxVersion}).`)
        version = firefoxVersion;
    }

    const base = `https://archive.mozilla.org/pub/firefox/releases/${version}/source/`
    const filename = `firefox-${version}.source.tar.xz`;

    const url = `${base}${filename}`;

    log.info(`Locating Firefox release ${version}...`)

    if(existsSync(resolve(process.cwd(), ".dotbuild", `firefox-${version.split("b")[0]}`))) {
        log.error(`Cannot download version ${version.split("b")[0]} as it already exists at "${resolve(process.cwd(), ".dotbuild", `firefox-${version.split("b")[0]}`)}"`)
    }

    if(version == firefoxVersion) log.info(`Version is frozen at ${firefoxVersion}!`)
    if(version.includes("b")) log.warning("Version includes non-numeric characters. This is probably a beta.")

    if(
        fs.existsSync(resolve(process.cwd(), "firefox", version.split("b")[0])) ||
        fs.existsSync(resolve(process.cwd(), "firefox", "firefox-" + version.split("b")[0]))
    ) log.error(`Workspace with version "${version.split("b")[0]}" already exists.\nRemove that workspace and run |${bin_name} download ${version}| again.`)

    log.info(`Downloading Firefox release ${version}...`)

    const { data, headers } = await axios.get(url, { 
        responseType: "stream"
    })
    
    const length = headers['content-length']

    const writer = fs.createWriteStream(resolve(process.cwd(), filename))
    
    let receivedBytes = 0;

    data.on("data", (chunk: any) => {
        receivedBytes += chunk.length;
    
        let rand = Math.floor(Math.random() * 1000 + 1);

        if(rand > 999.5) {
            let percentCompleted = parseInt(Math.round(((receivedBytes * 100) / length)).toFixed(0));
            if((percentCompleted % 2 == 0) || percentCompleted >= 100) return;
            log.info(`\t${filename}\t${percentCompleted}%...`)
        }
    })

    data.pipe(writer)

    data.on("end", () => {
        unpack(filename, version)
    })
}