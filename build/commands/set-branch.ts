import execa from "execa";
import {
    existsSync,
    readFileSync,
    writeFileSync
} from "fs-extra";
import { resolve } from "path";
import { log } from "..";

export const setBranch = async (branch: string) => {
    if (
        !existsSync(
            resolve(
                process.cwd(),
                ".dotbuild",
                "metadata"
            )
        )
    ) {
        return log.error(
            "Cannot find metadata, aborting..."
        );
    }

    const metadata = JSON.parse(
        readFileSync(
            resolve(
                process.cwd(),
                ".dotbuild",
                "metadata"
            ),
            "utf-8"
        )
    );

    try {
        await execa("git", [
            "rev-parse",
            "--verify",
            branch
        ]);

        metadata.branch = branch;

        writeFileSync(
            resolve(
                process.cwd(),
                ".dotbuild",
                "metadata"
            ),
            JSON.stringify(metadata)
        );

        log.success(
            `Default branch is at \`${branch}\`.`
        );
    } catch (e) {
        return log.error(
            `Branch with name \`${branch}\` does not exist.`
        );
    }
};
