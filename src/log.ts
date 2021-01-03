import chalk from 'chalk';

class Log {
    private startTime: number[];

    constructor() {
        const d = new Date();

        this.startTime = [d.getHours(), d.getMinutes(), d.getSeconds()]
    }

    private withLeading(num: number) {
        return num.toString().padStart(2, '0')
    }

    private getDiff() {
        const d = new Date();

        const hours = d.getHours() - this.startTime[0]
        const mins = d.getMinutes() - this.startTime[1]
        const secs = d.getSeconds() - this.startTime[2]

        const format = (r: number) => {
            return r.toString().length == 1 ? "0" + r : r
        }

        return `${format(hours)}:${format(mins)}:${format(secs)}`
    }

    info(...args: any[]) {
        console.info(chalk.blueBright.bold(this.getDiff()), ...args)
    }

    warning(...args: any[]) {
        console.info(chalk.yellowBright.bold(" WARNING"), ...args)
    }

    success(...args: any[]) {
        console.log(`\n   ${chalk.greenBright.bold("SUCCESS")}`, ...args)
    }


    error(...args: any[]) {
        throw new Error(...args);
    }
}

export default Log;