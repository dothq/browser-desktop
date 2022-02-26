import chalk from "chalk";
import execa from "execa";
import { ensureDirSync, existsSync, statSync, writeFile } from "fs-extra";
import { tmpdir } from "os";
import { resolve } from "path";
import stringWidth from "string-width";
import { Melon } from "..";
import { info, lightError, question, success, yesno } from "../utils/log";
import { engineDir } from "../utils/path";
import { $$ } from "../utils/sh";

export class CommitCommand {
    public name = "commit";
    public description = "Stage and commit files in the engine directory ready for patch generation.";

    public aliases = [
        "com"
    ]

    public async exec(cli: Melon) {
        await $$({ cwd: engineDir, noErrorKill: true, shutUp: true })`git restore --staged dot`
        await $$({ cwd: engineDir, noErrorKill: true, shutUp: true })`git restore --staged dot/`

        const { data: staged } = await $$({ cwd: engineDir, shutUp: true })`git --no-pager diff --name-only --staged`;

        if(staged.split("\n").filter(ln => ln.trim().length).length == 0) {
            info(`Nothing to commit.`);
            info(`Try adding some files from engine by typing \`./melon br git add <file>\`.`)
            return process.exit(0);
        }

        ensureDirSync(resolve(tmpdir(), "melonbuild"))

        if(!existsSync(resolve(tmpdir(), "melonbuild", "id-lock"))) {
            const { data: email } = await $$({ shutUp: true })`git config user.email`;
            const { data: name } = await $$({ shutUp: true })`git config user.name`;
    
            if(!email || !email.length) return lightError(`Invalid Git configuration: user.email`);
            if(!name || !name.length) return lightError(`Invalid Git configuration: user.name`);

            info(`Your Git email and username will be publicly visible in patches.`);
            console.log(`      • Name: ${name}`);
            console.log(`      • Email: ${email}`);
            info(`Learn more: https://www.git-scm.com/book/en/v2/Customizing-Git-Git-Configuration`)
    
            writeFile(resolve(tmpdir(), "melonbuild", "id-lock"), "");
        }

        const cols = staged.split("\n")
            .map(ln => `      • ${ln}`)
            .join("\n");

        info(`Staged files:`)
        console.log(cols);

        let commitMsg = await question("Short description of this change");
        commitMsg = commitMsg.trim();

        if(!commitMsg.length) {
            return lightError(`Subject must be set!`)
        };

        let commitDescription = await question(`Longer description of this change ${chalk.dim(`(Optional)`)}`);
        commitDescription = commitDescription.trim();

        await $$({ cwd: engineDir })`${[
            "git",
            "commit",
            "-sm",
            JSON.stringify(commitMsg)
        ].concat(
            commitDescription.length 
                ? ["-m", JSON.stringify(commitDescription)] 
                : []
        ).join(" ")}`;

        if(process.argv.includes("-e") || process.argv.includes("--export")) {
            execa("./melon", ["export"]).stdout?.pipe(process.stdout);
        } else {
            success(`You are ready to export these changes to a patch. Run \`./melon export\` to export the changes.`);
        }
    }
}