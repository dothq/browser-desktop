import { Command } from "commander";
import { existsSync, readFileSync } from "fs";
import { resolve } from "path";
import { bin_name, log } from "..";
import { dispatch } from "../utils";

export const init = async (directory: Command) => {
    if (process.platform == "win32") {
        // Because Windows cannot handle paths correctly, we're just calling a script as the workaround.
        log.info(
            "Successfully downloaded browser source. Please run |./windows-init.sh| to finish up."
        );
        process.exit(0);
    }

    const cwd = process.cwd();

    const dir = resolve(
        cwd as string,
        directory.toString()
    );

    if (!existsSync(dir)) {
        log.error(
            `Directory "${directory}" not found.\nCheck the directory exists and run |${bin_name} init| again.`
        );
    }

    let version = readFileSync(
        resolve(
            cwd,
            directory.toString(),
            "browser",
            "config",
            "version_display.txt"
        ),
        "utf-8"
    );

    if (!version)
        log.error(
            `Directory "${directory}" not found.\nCheck the directory exists and run |${bin_name} init| again.`
        );

    version = version.trim().replace(/\\n/g, "");

    await dispatch("git", ["init"], dir as string);
    await dispatch(
        "git",
        ["checkout", "--orphan", version],
        dir as string
    );
    await dispatch(
        "git",
        ["add", "-v", "-f", "."],
        dir as string
    );
    await dispatch(
        "git",
        ["commit", "-am", `"Firefox ${version}"`],
        dir as string
    );
    await dispatch(
        "git",
        ["checkout", "-b", "dot"],
        dir as string
    );
};
