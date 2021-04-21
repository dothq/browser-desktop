import chalk from "chalk";

class Log {
    private startTime: number;

    constructor() {
        const d = new Date();

        this.startTime = d.getTime();
    }

    getDiff() {
        const d = new Date();

        const currentTime = d.getTime();

        const elapsedTime = currentTime - this.startTime;

        var secs = Math.floor((elapsedTime / 1000) % 60);
        var mins = Math.floor(
            (elapsedTime / (60 * 1000)) % 60
        );
        var hours = Math.floor(
            (elapsedTime / (60 * 60 * 1000)) % 24
        );

        const format = (r: number) => {
            return r.toString().length == 1 ? "0" + r : r;
        };

        return `${format(hours)}:${format(mins)}:${format(
            secs
        )}`;
    }

    info(...args: any[]) {
        console.info(
            chalk.blueBright.bold(this.getDiff()),
            ...args
        );
    }

    warning(...args: any[]) {
        console.info(
            chalk.yellowBright.bold(" WARNING"),
            ...args
        );
    }

    hardWarning(...args: any[]) {
        console.info(
            "",
            chalk.bgRed.bold("WARNING"),
            ...args
        );
    }

    success(...args: any[]) {
        console.log(
            `\n${chalk.greenBright.bold("SUCCESS")}`,
            ...args
        );
    }

    error(...args: any[]) {
        throw new Error(...args);
    }
}

export default Log;
