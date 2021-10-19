import { exportPublic } from "../shared/globals";

export class Timers {
    public list: Map<string, number> = new Map();

    public start(label: string) {
        this.list.set(
            label,
            Date.now()
        );
    }

    public stop(label: string) {
        const now = Date.now();

        const timeStart = this.list.get(label);

        if(timeStart) {
            console.info(`${label}: ${now - timeStart} ms`)
        } else {
            console.warn(`Timer with label '${label}' does not exist.`)
        }
    }
}

export const timers = new Timers();
exportPublic("timers", timers);