const { Octokit } = require("@octokit/rest");
const axios = require("axios");
const semver = require('semver');

const gh = new Octokit({
    auth: process.env.ROBOT_TOKEN,
});

const main = async () => {
    const { versions } = require("./package.json");

    const res = await axios.get(`https://download.mozilla.org/?product=firefox-latest-ssl&os=linux64&lang=en-US`);

    const version = res.request.path.replace("/pub/firefox/releases/", "").split("/")[0];

    if(!version || !versions || !versions["firefox-display"]) throw new Error("Bad version");
    if(!semver.lt(versions["firefox-display"], version)) return;

    const { data } = await gh.issues.listForRepo({
        owner: "dothq",
        repo: "browser",
        state: "open",
        labels: "behind-upstream",
        creator: "dothq-robot"
    })

    console.log(data)

    if(data.length == 0) {
        console.log("no notif yet, sending...")

        await gh.issues.create({
            owner: "dothq",
            repo: "browser",
            title: "⚠ Dot Browser Desktop is not matching upstream version!",
            labels: "behind-upstream",
            assignees: "dothq-robot,EnderDev",
            body: `## Version comparison
    
* **Dot Browser Version** - \`${versions["firefox-display"]}\`
* **Firefox Version** - \`${version}\`

---

###### This issue was automatically generated because Dot Browser for Desktop's version is behind from upstream's.`
        })
    } else {
        console.log("notif exists, aborting...")
    }
}

main();
