/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import chalk from "chalk";
import execa from "execa";
import {
	info,
	infoLevel,
	lightError
} from "./log";
import { createProgress } from "./progress";

type Options = execa.Options & {
    shutUp?: boolean;
    stream?: boolean;
    noErrorKill?: boolean;
    writeErrorToData?: boolean;
    onStartError?: (err: Error) => void;
};

const strippablePrefixes = ["fatal:", "info:", "error:"];

const notErrors = [
    "auto packing the repository",
    'see "git help gc"'
];

interface Response {
    code: number;
    data: string;
}

const execute = async (
    strings: any,
    options?: Options
): Promise<Response> => {
    return new Promise((resolve) => {
        const merged = deepMerge(strings);

        // splits by space but preserves quoted items
        const strs = merged
            .join("")
            .split(/ (?=(?:(?:[^"]*"){2})*[^"]*$)/g);

        const command = strs[0];
        const args = strs
            .slice(1)
            .map((r: any) => r.replace(/\"/g, ""));

		const opts: Options = {
			shutUp: false,
			stream: false,
			noErrorKill: false,
			writeErrorToData: false,
			onStartError: () => {},
			...(options || {}),
			env: {
				MACH_USE_SYSTEM_PYTHON: "1",
				...process.env,
				...(options?.env || {}),
			},
		};

        if (!opts.shutUp) {
            info(chalk.dim(`$ ${merged.join("")}`));
        }

        const progress =
            opts.stream && !opts.shutUp
                ? createProgress("info", {
                      text: ""
                  })
                : null;

        let output: string[] = [];

        const handle = (type: any, data: any) => {
            const lns = data
                .toString()
                .split("\n")
                .map((ln: string) => ln.trim())
                .filter((ln: string) => ln.length);

            if (type !== "error" || opts.writeErrorToData)
                output = output.concat(lns);
            if (opts?.shutUp) return;
            if (opts?.shutUp && type !== "error") return;

            for (let ln of lns) {
                if (
                    strippablePrefixes.includes(
                        ln.split(" ")[0]
                    )
                ) {
                    for (const prefix of strippablePrefixes) {
                        ln = ln
                            .replace(prefix, "")
                            .trim();
                    }
                }

                if (
                    !!notErrors.find((i) =>
                        i.startsWith(ln.toLowerCase())
                    )
                ) {
                    type = "info";
                }

                switch (type) {
                    case "info":
                        if (
                            progress &&
                            ln.trim().length
                        ) {
                            if (!progress?.isSpinning)
                                progress?.start();

                            progress.prefixText =
                                infoLevel;
                            progress.text = ln;
                        } else {
                            info(ln);
                        }

                        break;
                    case "lighterror":
                        lightError(ln);
                        break;
                    case "error":
                        if (progress) progress?.end();
                        lightError(ln);
                        break;
                }
            }
        };

        const proc = execa(command, args, opts);

        proc.stdout?.on("data", (d) => handle("info", d));
        proc.stderr?.on("data", (d) => handle("info", d));

        proc.stdout?.on("error", (d) =>
            handle("error", d)
        );
        proc.stderr?.on("error", (d) =>
            handle("error", d)
        );

        proc.on("exit", (code: number) => {
            if (progress) progress.end();

            if (code !== 0 && !opts.noErrorKill) {
                lightError(
                    "Command failed. See error above."
                );

                process.exit(code);
            }

            resolve({
                code,
                data: output.join("\n")
            });
        });

        proc.on("exit", (code) => {
            resolve(code as any);
        });
    });
};

const deepMerge = (strings: any): any => {
    let a = [];

    for (const str of strings) {
        if (typeof str == "string") a.push(str);
        else a.push(deepMerge(str).join(""));
    }

    return a;
};

export async function $(...strings: any) {
    return execute(strings);
}

export function $$(options?: Options) {
    return async function (...strings: any) {
        return execute(strings, options);
    };
}
