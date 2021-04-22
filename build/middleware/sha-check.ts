import execa from "execa";
import { existsSync, readFileSync } from "fs-extra";
import { resolve } from "path";
import { bin_name, log } from "..";

const blacklistedCommands = [
    "reset",
    "init",
    "set-branch"
];

export const shaCheck = async (command: string) => {
    if (
        blacklistedCommands.filter((c) =>
            command.startsWith(c)
        ).length !== 0 ||
        !existsSync(
            resolve(
                process.cwd(),
                ".dotbuild",
                "metadata"
            )
        )
    )
        return;

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

    const { stdout: currentBranch } = await execa("git", [
        "branch",
        "--show-current"
    ]);

    if (metadata && metadata.branch) {
        if (metadata.branch !== currentBranch) {
            log.warning(`The current branch \`${currentBranch}\` differs from the original branch \`${metadata.branch}\`.
            
\t If you are changing the Firefox version, you will need to reset the tree
\t with |${bin_name} reset --hard| and then |${bin_name} download|.

\t Or you can change the default branch by typing |${bin_name} set-branch <branch>|.`);
        }
    }
};
