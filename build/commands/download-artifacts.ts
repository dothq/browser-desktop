import axios from 'axios';
import { log } from '..';
import fs, { existsSync } from 'fs';
import { resolve } from 'path';
import execa from 'execa';
import { moveSync } from 'fs-extra';

export const downloadArtifacts = async () => {
  if(process.platform !== "win32") log.error("This is not a Windows machine, will not download artifacts.")

  const filename = "mozbuild.tar.bz2"
  const url = `https://github.com/dothq/windows-artifacts/releases/latest/download/mozbuild.tar.bz2`;

  log.info(`Locating Windows artifacts...`)

  const home = require("os").homedir()

  if(existsSync(resolve(home, `.mozbuild`))) return log.info(`Not donwloading mozbuild as it already exists at "${resolve(home, `.mozbuild`)}"`)

  log.info(`Downloading Windows artifacts...`)

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

  data.on("end", async () => {
      log.info("Unpacking mozbuild...")

      await execa("tar", ["-xvf", filename, "-C", home])

      log.info("Done extracting mozbuild artifacts.")
  })
}