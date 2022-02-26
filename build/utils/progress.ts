import ora, { Options, Ora } from "ora";
import { cli } from "..";
import { infoLevel, successLevel, warnLevel } from "./log";

const levels: any = {
    info: infoLevel,
    warn: warnLevel,
    warning: warnLevel,
    success: successLevel,
    ok: successLevel
}

export const createProgress = (level: string, options?: Options) => {
    const prog: Ora & { end: () => Ora } = ora({
        text: "One moment...",
        ...options,
        prefixText: level in levels ? levels[level] : "",
        spinner: {
            frames: [""]
        },
        indent: 0
    }) as any;

    prog.end = () => {
        const text = prog.text;

        prog.stop();
        level in cli ? (cli as any)[level](text) : console.log(text);

        return prog;
    }

    return prog;
}