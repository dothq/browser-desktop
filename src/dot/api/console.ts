import { EventEmitter } from "events";
import { InspectOptions } from "util";
import { AppConstants, ChromeUtils } from "../modules";

export class ConsoleAPI {
    public debug(...data: any[]) {
        if (!AppConstants.DEBUG) return;

        const errorStub: any = new Error();
        const callee = errorStub.stack.split("at ")[1].trim();

        console.debug(`debug:`, callee, ...data);
    }

    public error(...data: any[]) {
        const errorStub: any = new Error();
        const callee = errorStub.stack.split("at ")[1].trim();

        console.error(`error:`, callee, ...data);
    }

    public info(...data: any[]) {
        if (!AppConstants.DEBUG) return;

        const errorStub: any = new Error();
        const callee = errorStub.stack.split("at ")[1].trim();

        console.info(`info:`, callee, ...data);
    }

    public log(...data: any[]) {
        if (!AppConstants.DEBUG) return;

        const errorStub: any = new Error();
        const callee = errorStub.stack.split("at ")[1].trim();

        console.log(`log:`, callee, ...data);
    }

    public warn(...data: any[]) {
        const errorStub: any = new Error();
        const callee = errorStub.stack.split("at ")[1].trim();

        console.warn(`warn:`, callee, ...data);
    }

    constructor() {

    }
}