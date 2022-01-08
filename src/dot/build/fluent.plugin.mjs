import {
    mkdirSync,
    readdirSync,
    readFileSync,
    writeFileSync
} from "fs";
import glob from "glob";
import { resolve } from "path";

export const FluentPlugin = {
    name: "fluent",
    setup(build) {
        const l10nPath = resolve(process.cwd(), "l10n");

        const languages = readdirSync(l10nPath, {
            withFileTypes: true
        })
            .filter((i) => i.isDirectory())
            .map((i) => i.name);

        try {
            mkdirSync(resolve(process.cwd(), "dist"));
        } catch (e) {}

        for (const lang of languages) {
            let strings = glob.sync(
                `${l10nPath}/${lang}/**/*.ftl`
            );
            strings = strings.sort(
                (a, b) =>
                    a.split("/").length -
                    b.split("/").length
            );

            let data = `# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at http://mozilla.org/MPL/2.0/.

# THIS FILE IS AUTO-GENERATED. DO NOT EDIT.`;

            for (const str of strings) {
                const ftl = readFileSync(str, "utf-8");

                data += `\n\n# ${str.replace(
                    `${l10nPath}/${lang}/`,
                    ""
                )}\n\n${ftl}`;
            }

            writeFileSync(
                resolve(
                    process.cwd(),
                    "dist",
                    `${lang}.ftl`
                ),
                data
            );

            console.log(`  dist/${lang}.ftl`);
        }

        return {};
    }
};
