const execa = require("execa");
const {
    readFileSync,
    writeFileSync
} = require("fs");
const { resolve } = require("path");

const REGEX = /MOZ_SOURCE_CHANGESET=[a-zA-Z0-9]*$/;

const main = async () => {
    let mozconfig = readFileSync(
        resolve(
            process.cwd(),
            "configs",
            "common",
            "mozconfig"
        ),
        "utf-8"
    );

    const { stdout: changeset } = await execa("git", [
        "rev-parse",
        "HEAD"
    ]);
    mozconfig = mozconfig.replace(
        REGEX,
        `MOZ_SOURCE_CHANGESET=${changeset}`
    );

    console.log(mozconfig);

    writeFileSync(
        resolve(
            process.cwd(),
            "configs",
            "common",
            "mozconfig"
        ),
        mozconfig
    );
};

main();
