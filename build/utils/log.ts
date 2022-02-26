import chalk from "chalk";
import { createInterface } from "readline";
import { hideBin } from "yargs/helpers";

export const infoLevel = chalk.blueBright.bold("info");
export const questionLevel = chalk.magentaBright.bold("question");
export const warnLevel = chalk.yellowBright.bold("warning");
export const successLevel = chalk.greenBright.bold("success");
export const errorLevel = chalk.redBright.bold("error");

export const info = (...args: any[]) => {
    console.info(
        infoLevel,
        ...args
    );
}

export const warning = (...args: any[]) => {
    console.info(
        warnLevel,
        ...args
    );
}

export const success = (...args: any[]) => {
    console.log(
        successLevel,
        ...args
    );
}

export const lightError = (...args: any[]) => {
    console.log(
        errorLevel,
        ...args
    );
}

export const error = (...args: any[]) => {
    throw new Error(...args);
}

export const yesno = (...args: any[]): Promise<boolean> => {
    return new Promise((resolve) => {
        const cleanBin = hideBin(process.argv);

        let defaultOption = ["y", "N"];
        const options = args[args.length - 1];
        const isYDefault = options.defaultResponse && options.defaultResponse == true;

        if(options && typeof options == "object") {
            args.pop();

            if(isYDefault) {
                defaultOption = ["Y", "n"];
            }
        }

        args.splice(0, 0, questionLevel);
        args.push(chalk.dim(`(${defaultOption.join("/")}) `));

        const msg = [...args].join(" ");

        if(cleanBin.includes("--yes")) {
            console.log(msg + "y");
            return resolve(true);
        }

        process.stdout.write(msg);

        process.stdin.setRawMode(true);
        process.stdin.once("data", (data) => {
            const answer = data.toString("utf-8");

            process.stdout.clearLine(0);
            process.stdout.cursorTo(0);
            process.stdout.write(msg + answer);

            console.log();
            process.stdin.resume();
            process.stdin.setRawMode(false);

            if(answer.toLowerCase() == "y") return resolve(!isYDefault);
            else return resolve(!!isYDefault);
        })
    })
}

export const question = (...args: any[]): Promise<string> => {
    return new Promise((resolve) => {
        args.splice(0, 0, questionLevel);
        args.push(chalk.dim("› "));

        const msg = [...args].join(" ");
        
        const rl = createInterface({
            input: process.stdin,
            output: process.stdout
        });
        
        rl.question(msg, (answer) => {
            rl.close();

            return resolve(answer);
        });

        rl.resume();
    })
}