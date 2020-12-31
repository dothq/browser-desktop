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

    await dispatch(`./${bin_name}`, ["init", "firefox"]);

    log.success(`You should be ready to make changes to Dot Browser.\n\n\t   To learn about what to do next, head to https://example.com.`)
    console.log()

    pjson.versions["firefox-display"] = version;
    pjson.versions["firefox"] = version.split("b")[0];

    writeFileSync(resolve(process.cwd(), "package.json"), JSON.stringify(pjson, null, 2))
}

export const download = async (version: string) => {
    const firefoxVersion = pjson.versions["firefox-display"];

    if(!version) {
        const res = await axios.head(`https://download.mozilla.org/?product=firefox-latest-ssl&os=linux64&lang=en-US`)

        version = res.request.path.replace("/pub/firefox/releases/", "").split("/")[0]

        if(firefoxVersion) version = firefoxVersion;
    }

    const base = `https://archive.mozilla.org/pub/firefox/releases/${version}/source/`
    const filename = `firefox-${version}.source.tar.xz`;

    const url = `${base}${filename}`;

    log.info(`Locating Firefox release ${version}...`)

    if(existsSync(resolve(process.cwd(), ".dotbuild", `firefox-${version.split("b")[0]}`))) {
        log.error(`Cannot download version ${version.split("b")[0]} as it already exists at "${resolve(process.cwd(), ".dotbuild", `firefox-${version.split("b")[0]}`)}"`)
    }

    const res = await axios.head(url)

    if(res.status == 200) {
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
    } else {
        log.error(`Could not locate that version of Firefox!`)
    }
}