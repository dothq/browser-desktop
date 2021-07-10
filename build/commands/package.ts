import execa from "execa";
import { existsSync } from "fs";
import { resolve } from "path";
import { bin_name, log } from "..";
import { ENGINE_DIR } from "../constants";

export const melonPackage = async () => {
    if (existsSync(ENGINE_DIR)) {
        const artifactPath = resolve(ENGINE_DIR, "mach");

        if (existsSync(artifactPath)) {
            const args = ["package"];

            log.info(
                `Packaging \`dot\` with args ${JSON.stringify(
                    args.slice(1, 0)
                )}...`
            );

            execa(artifactPath, args).stdout?.pipe(
                process.stdout
            );
        } else {
            log.error(
                `Cannot binary with name \`mach\` in ${resolve(
                    ENGINE_DIR
                )}`
            );
        }
    } else {
        log.error(
            `Unable to locate any source directories.\nRun |${bin_name} download| to generate the source directory.`
        );
    }
};
