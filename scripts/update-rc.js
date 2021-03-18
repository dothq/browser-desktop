const { Octokit } = require("@octokit/rest");
const {
    readFileSync,
    writeFileSync
} = require("fs");
const { resolve } = require("path");

const gh = new Octokit({
    auth: process.env.ROBOT_TOKEN
});

const main = async () => {
    const rc = JSON.parse(
        readFileSync(
            resolve(
                __dirname,
                "release-channels.json"
            ),
            "utf-8"
        )
    );

    const currentTime = new Date().toISOString();

    if (currentTime > rc.next_merge.beta) {
        console.log(
            "Beta branch is due a merge!"
        );

        const data = await gh.repos.compareCommits(
            {
                owner: "dothq",
                repo: "browser-desktop",
                head: "beta",
                base: "main"
            }
        );

        console.log(data);

        gh.pulls.create({
            owner: "dothq",
            repo: "browser-desktop",
            title: "🔀 Beta merge day",
            head: "main",
            base: "beta",
            body: `## Changes\n${data.commits.map(
                (commit) => {
                    return `* ${commit.commit.message} - @${commit.author.login}`;
                }
            )}`,
            draft: true
        });

        console.log("Created PR for merge day");
        console.log(
            "Setting next merge date..."
        );

        const d = new Date(rc.next_merge.beta);
        d.setDate(d.getDate() + 4 * 7);
        rc.next_merge.beta = d.toISOString();
    } else if (
        currentTime > rc.next_merge.stable
    ) {
        console.log(
            "Stable branch is due a merge!"
        );

        const {
            data
        } = gh.repos.compareCommits({
            owner: "dothq",
            repo: "browser-desktop",
            head: "main",
            base: "stable"
        });

        gh.pulls.create({
            owner: "dothq",
            repo: "browser-desktop",
            title: "🔀 Stable merge day",
            head: "main",
            base: "stable",
            body: `## Changes\n${data.commits.map(
                (commit) => {
                    return `* ${commit.commit.message} - @${commit.author.login}`;
                }
            )}`,
            draft: true
        });

        console.log("Created PR for merge day");
        console.log(
            "Setting next merge date..."
        );

        const d = new Date(
            rc.next_merge.stable
        );
        d.setDate(d.getDate() + 4 * 7);
        rc.next_merge.stable = d.toISOString();
    } else {
        console.log(
            "Nothing is due a merge just yet."
        );
    }

    writeFileSync(
        resolve(
            __dirname,
            "release-channels.json"
        ),
        JSON.stringify(rc, null, 2)
    );
};

main();
