import { Command } from 'commander';
import axios from 'axios';
import { SEMVER_REGEX } from './constants';

const program = new Command();

program
  .storeOptionsAsProperties(false)
  .passCommandToAction(false);

program.version(require("../package.json").version);
program.name("dot")

program
    .command("download [version]")
    .description("Download a release of Firefox.")
    .action(async (version) => {
        if(!version) {
            const res = await axios.head(`https://download.mozilla.org/?product=firefox-latest-ssl&os=linux64&lang=en-US`)
   
            version = res.request.path.replace("/pub/firefox/releases/", "").split("/")[0]
        }

        if(SEMVER_REGEX.test(version)) {
            console.log(version)
        } else {
            console.error("Version must be in the SemVer format!")
        }
    })

program.parse(process.argv);