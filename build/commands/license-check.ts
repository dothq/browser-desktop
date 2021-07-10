import chalk from "chalk";
import { readdirSync, readFileSync } from "fs-extra";
import { resolve } from "path";
import { log } from "..";
import { ENGINE_DIR, PATCHES_DIR } from "../constants";

const ignoredExt = [".json", ".bundle.js"];

export const licenseCheck = async () => {
    log.info("Checking project...");

    let patches = readdirSync(PATCHES_DIR).map((p) => p);

    patches = patches.filter((p) => p !== ".index");

    const originalPaths = patches.map((p) => {
        const data = readFileSync(
            resolve(PATCHES_DIR, p),
            "utf-8"
        );

        return data
            .split("diff --git a/")[1]
            .split(" b/")[0];
    });

    let passed: string[] = [];
    let failed: string[] = [];
    let ignored: string[] = [];

    originalPaths.forEach((p) => {
        const data = readFileSync(
            resolve(ENGINE_DIR, p),
            "utf-8"
        );
        const headerRegion = data
            .split("\n")
            .slice(0, 32)
            .join(" ");

        const passes =
            headerRegion.includes(
                "http://mozilla.org/MPL/2.0"
            ) &&
            headerRegion.includes(
                "This Source Code Form"
            ) &&
            headerRegion.includes("copy of the MPL");

        const isIgnored = ignoredExt.find((i) =>
            p.endsWith(i)
        )
            ? true
            : false;
        isIgnored && ignored.push(p);

        if (!isIgnored) {
            if (passes) passed.push(p);
            else if (!passes) failed.push(p);
        }
    });

    let maxPassed = 5;
    let i = 0;

    for (const p of passed) {
        log.info(
            `${p}... ${chalk.green("✔ Pass - MPL-2.0")}`
        );

        if (i >= maxPassed) {
            log.info(
                `${chalk.gray.italic(
                    `${
                        passed.length - maxPassed
                    } other files...`
                )} ${chalk.green("✔ Pass - MPL-2.0")}`
            );
            break;
        }

        ++i;
    }

    failed.forEach((p, i) => {
        log.info(`${p}... ${chalk.red("❗ Failed")}`);
    });

    ignored.forEach((p, i) => {
        log.info(`${p}... ${chalk.gray("➖ Ignored")}`);
    });
};
