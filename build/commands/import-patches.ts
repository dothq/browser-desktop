import { readdirSync } from "fs-extra";
import { log } from "..";
import { PATCHES_DIR } from "../constants";
import Patch from "../controllers/patch";
import manualPatches from "../manual-patches";
import { delay } from "../utils";

const importManual = async (minimal?: boolean) => {
    log.info(
        `Applying ${manualPatches.length} manual patches...`
    );

    if (!minimal) console.log();

    await delay(500);

    return new Promise(async (res, rej) => {
        var total = 0;

        var i = 0;

        for await (const {
            name,
            action,
            src,
            markers,
            indent
        } of manualPatches) {
            ++i;

            const p = new Patch({
                name,
                action,
                src,
                type: "manual",
                status: [i, manualPatches.length],
                markers,
                indent,
                options: {
                    minimal
                }
            });

            await delay(100);

            await p.apply();
        }

        log.success(
            `Successfully imported ${manualPatches.length} manual patches!`
        );
        console.log();

        await delay(1000);

        res(total);
    });
};

const importPatchFiles = async (minimal?: boolean) => {
    let patches = readdirSync(PATCHES_DIR);

    patches = patches.filter((p) => p == ".index");

    log.info(`Applying ${patches.length} patch files...`);

    if (!minimal) console.log();

    await delay(500);

    var i = 0;

    for await (const patch of patches) {
        ++i;

        const p = new Patch({
            name: patch,
            type: "file",
            status: [i, patches.length],
            options: {
                minimal
            }
        });

        await delay(100);

        await p.apply();
    }

    log.success(
        `Successfully imported ${patches.length} patch files!`
    );
};

interface Args {
    minimal?: boolean;
}

export const importPatches = async (args: Args) => {
    await importManual(args.minimal);
    await importPatchFiles(args.minimal);
};
