import axios from 'axios';
import { bin_name, log } from '..';
import fs from 'fs';
import { resolve } from 'path';
import execa from 'execa';

const unpack = async (name: string) => {
    await execa("mkdir", ["-p", "firefox"])
    await execa("tar", ["-xvf", name, "-C", "firefox"]);
    await execa(bin_name, ["fix-workspaces"]);
    await execa(bin_name, ["init", name.split("b")[0]]);
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
            log.info(`Unpacking Firefox...`)
            unpack(filename)
        })
    } else {
        log.error(`Could not locate that version of Firefox!`)
    }
}