import { readdirSync } from "fs-extra";
import { bin_name, log } from "..";
import { PATCHES_DIR } from "../constants";
import Patch from "../controllers/patch";
import manualPatches from "../manual-patches";
import { delay, dispatch } from "../utils";

const importManual = async (
    minimal?: boolean,
    noIgnore?: boolean
) => {
    log.info(
        `Applying ${manualPatches.length} manual patches...`
    );

    if (!minimal) console.log();

    await delay(500);

    return new Promise(async (res, rej) => {
        var total = 0;

        var i = 0;

        for await (let {
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
                    minimal,
                    noIgnore
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

const importPatchFiles = async (
    minimal?: boolean,
    noIgnore?: boolean
) => {
    let patches = readdirSync(PATCHES_DIR);

    patches = patches.filter((p) => p !== ".index");

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
                minimal,
                noIgnore
            }
        });

        await delay(100);

        await p.apply();
    }

    console.log();
    await dispatch(
        `./${bin_name}`,
        ["doctor", "patches"],
        process.cwd(),
        true,
        true
    );

    log.success(
        `Successfully imported ${patches.length} patch files!`
    );
};

interface Args {
    minimal?: boolean;
    noignore?: boolean;
}

export const importPatches = async (
    type: string,
    args: Args
) => {
    if (type) {
        if (type == "manual")
            await importManual(args.minimal);
        else if (type == "file")
            await importPatchFiles(args.minimal);
    } else {
        await importManual(args.minimal, args.noignore);
        await importPatchFiles(
            args.minimal,
            args.noignore
        );
    }
};
