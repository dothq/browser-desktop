import { bin_name } from "..";
import { log } from "../";
import { SRC_DIR } from "../constants";
import { dispatch } from "../utils";

export const bootstrap = async () => {
    if (process.platform == "win32")
        log.error(
            `You do not need to bootstrap on Windows. As long as you ran |${bin_name} download-artifacts| everything should work fine.`
        );

    log.info(`Bootstrapping Dot Browser for Desktop...`);

    const args = ["--application-choice", "browser"];

    await dispatch(
        `./mach`,
        ["bootstrap", ...args],
        SRC_DIR
    );
};
