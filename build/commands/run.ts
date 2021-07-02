import { existsSync, readdirSync } from "fs";
import { resolve } from "path";
import { bin_name, log } from "..";
import { SRC_DIR } from "../constants";
import { dispatch } from "../utils";

const chromeUI = [
    {
        id: `dotui`,
        uri: `chrome://dot/content/browser.xhtml`
    }
];

export const run = async (chrome?: string) => {
    var chromePkg;

    if (chrome) {
        chromePkg = chromeUI.find((c) => c.id == chrome);

        if (!chromePkg)
            throw new Error(
                `Unable to locate chrome package named \`${chrome}\`.`
            );
    }

    const dirs = readdirSync(SRC_DIR);
    const objDirname: any = dirs.find((dir) => {
        return dir.startsWith("obj-");
    });

    if (!objDirname) {
        throw new Error(
            "Dot Browser needs to be built before you can do this."
        );
    }

    const objDir = resolve(SRC_DIR, objDirname);

    if (existsSync(objDir)) {
        dispatch(
            "./mach",
            ["run"].concat(
                chromePkg
                    ? ["-chrome", chromePkg.uri]
                    : []
            ),
            SRC_DIR,
            true,
            true
        );
    } else {
        log.error(
            `Unable to locate any built binaries.\nRun |${bin_name} build| to initiate a build.`
        );
    }
};
