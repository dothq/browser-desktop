import execa from "execa";
import { existsSync } from "fs";
import { resolve } from "path";
import { bin_name, log } from "..";

export const melonPackage = async () => {
    const cwd = resolve(process.cwd(), "src");

    if (existsSync(cwd)) {
        const artifactPath = resolve(
            cwd,
            "mach"
        );

        if (existsSync(artifactPath)) {
            const args = ["package"];

            log.info(
                `Packaging \`dot\` with args ${JSON.stringify(
                    args.slice(1, 0)
                )}...`
            );

            execa(
                artifactPath,
                args
            ).stdout?.pipe(process.stdout);
        } else {
            log.error(
                `Cannot binary with name \`mach\` in ${resolve(
                    cwd
                )}`
            );
        }
    } else {
        log.error(
            `Unable to locate any source directories.\nRun |${bin_name} download| to generate the source directory.`
        );
    }
};
