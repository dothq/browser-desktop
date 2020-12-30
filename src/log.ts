import chalk from 'chalk';

class Log {
    private startTime: Date;

    constructor() {
        this.startTime = new Date();
    }

    private withLeading(num: number) {
        return num.toString().padStart(2, '0')
    }

    private getDiff() {
        const d = new Date();

        const hours = d.getHours() - this.startTime.getHours()
        const mins = d.getMinutes() - this.startTime.getMinutes()
        const secs = d.getSeconds() - this.startTime.getSeconds()

        return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    }

    info(...args: any[]) {
        console.info(chalk.blueBright.bold(this.getDiff()), ...args)
    }

    warning(...args: any[]) {
        console.info(chalk.yellowBright.bold(" WARNING"), ...args)
    }

    error(...args: any[]) {
        throw new Error(...args);
    }
}

export default Log;