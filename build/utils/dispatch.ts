import execa from "execa";
import { log } from "..";

const handle = (data: any, killOnError?: boolean) => {
    const d = data.toString();

    d.split("\n").forEach((line: any) => {
        if (line.length !== 0) log.info(line);
    });

    if (killOnError) {
        log.error("Command failed. See error above.");
        process.exit(-1);
    }
};

export const dispatch = (
    cmd: string,
    args?: any[],
    cwd?: string,
    noLog?: boolean,
    killOnError?: boolean
) => {
    return new Promise((resolve, reject) => {
        if (!noLog)
            log.info(
                `Starting child "${cmd} ${args?.join(
                    " "
                )}".`
            );

        const proc = execa(cmd, args, {
            cwd: cwd ? cwd : process.cwd()
        });

        proc.stdout?.on("data", (d) => handle(d));
        proc.stderr?.on("data", (d) => handle(d));

        proc.stdout?.on("error", (d) =>
            handle(d, killOnError)
        );
        proc.stderr?.on("error", (d) =>
            handle(d, killOnError)
        );

        proc.on("exit", () => {
            if (!noLog)
                log.info(
                    `Done with "${cmd} ${args?.join(
                        " "
                    )}".`
                );
            resolve(true);
        });
    });
};
