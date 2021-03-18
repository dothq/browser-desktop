import execa from "execa";
import { log } from ".";

const handle = (data: any) => {
    const d = data.toString();

    d.split("\n").forEach((line: any) => {
        if (line.length !== 0) log.info(line);
    });
};

export const dispatch = (
    cmd: string,
    args?: any[],
    cwd?: string,
    noLog?: boolean
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

        proc.stdout?.on("data", handle);
        proc.stderr?.on("data", handle);

        proc.stdout?.on("error", handle);
        proc.stderr?.on("error", handle);

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
