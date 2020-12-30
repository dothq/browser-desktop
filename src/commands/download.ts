import axios from 'axios';
import { log } from '..';
import { SEMVER_REGEX } from '../constants';

export const download = async (version: string) => {
    if(!version) {
        const res = await axios.head(`https://download.mozilla.org/?product=firefox-latest-ssl&os=linux64&lang=en-US`)

        version = res.request.path.replace("/pub/firefox/releases/", "").split("/")[0]
    }

    if(SEMVER_REGEX.test(version)) {
        log.info(`Downloading Firefox release ${version}...`)

        const res = await axios.head(`https://archive.mozilla.org/pub/firefox/releases/${version}`)

        if(res.status == 200) {
            log.info(`Downloading Firefox release ${version}...`)
        } else {
            log.error(`Could not locate that version of Firefox!`)
        }
    } else {
        log.error("Version argument must be in the SemVer format!")
    }
}