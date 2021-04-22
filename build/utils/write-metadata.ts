import execa from "execa";
import { writeFileSync } from "fs-extra";
import { resolve } from "path";

const pjson = require("../../package.json");

export const writeMetadata = async () => {
    const { stdout: sha } = await execa("git", [
        "rev-parse",
        "HEAD"
    ]);
    const { stdout: branch } = await execa("git", [
        "branch",
        "--show-current"
    ]);

    writeFileSync(
        resolve(process.cwd(), ".dotbuild", "metadata"),
        JSON.stringify({
            sha,
            branch,
            birth: Date.now(),
            versions: pjson.versions
        })
    );
};
