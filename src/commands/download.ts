import axios from 'axios';
import { bin_name, log } from '..';
import fs from 'fs';
import { resolve } from 'path';
import execa from 'execa';

const unpack = async (name: string, version: string) => {
    await execa("mkdir", ["-p", "firefox"]);

    log.info(`Unpacking Firefox...`)

    await execa("tar", ["-xvf", name, "-C", "firefox"]);

    await execa(`./${bin_name}`, ["fix-workspaces"]);
    await execa(`./${bin_name}`, ["init", version.split("b")[0]]);

    log.success(`You should be ready to make changes to Dot Browser.\n\n\t   To learn about what to do next, head to https://example.com.`)
    console.log()
}

export const download = async (version: string) => {
    if(!version) {
        const res = await axios.head(`https://download.mozilla.org/?product=firefox-latest-ssl&os=linux64&lang=en-US`)

        version = res.request.path.replace("/pub/firefox/releases/", "").split("/")[0]
    }

    const base = `https://archive.mozilla.org/pub/firefox/releases/${version}/source/`
    const filename = `firefox-${version}.source.tar.xz`;

    const url = `${base}${filename}`;

    log.info(`Locating Firefox release ${version}...`)

    const res = await axios.head(url)

    if(res.status == 200) {
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