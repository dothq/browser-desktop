const execa = require("execa");

const args = process.argv;

args.shift();
args.shift();

if (args[0] == "buildrun") {
    return execa("./melon", ["build"], { stdio: "inherit" }).then(_ => {
        execa("./melon", ["run"], { stdio: "inherit" });
    })
}

execa("./melon", [args], { stdio: "inherit" });