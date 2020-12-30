import chalk from 'chalk';

class Log {
    private startTime: Date;

    constructor() {
        this.startTime = new Date();
    }

    private withLeading(num: number) {
        return (num < 10 ? '0' : '') + num
    }

    private getDiff() {
        const d = new Date();

        const hours = d.getHours() - this.startTime.getHours()
        const mins = d.getMinutes() - this.startTime.getMinutes()
        const secs = d.getSeconds() - this.startTime.getSeconds()

        return `${this.withLeading(hours)}:${this.withLeading(mins)}:${this.withLeading(secs)}`
    }

    info(...args: any[]) {
        console.info(chalk.blueBright.bold(this.getDiff()), ...args)
    }

    error(...args: any[]) {
        console.error(chalk.blueBright.bold(this.getDiff()), ...args)
        throw new Error(...args);
    }
}

export default Log;