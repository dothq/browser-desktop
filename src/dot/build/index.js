import { analyzeMetafile, build } from "esbuild";
import SassPlugin from "esbuild-plugin-sass";
import { resolve } from "path";
import { FluentPlugin } from "./fluent.plugin.mjs";

const time = Date.now();

const entryPoints = {
    browser: resolve(process.cwd(), "index.ts")
};

const mplBanner = `/* This Source Code Form is subject to the terms of the Mozilla Public
* License, v. 2.0. If a copy of the MPL was not distributed with this
* file, You can obtain one at http://mozilla.org/MPL/2.0/. */
`;

const main = async () => {
    const result = await build({
        entryPoints,
        outdir: resolve(process.cwd(), "dist"),
        bundle: true,
        sourcemap: "both",
        metafile: true,
        minify: true,
        logLevel: "debug",
        plugins: [SassPlugin(), FluentPlugin],
        banner: {
            js: mplBanner
            // css: mplBanner
        }
    });

    if (process.env.NODE_ENV == "production") {
        const analysis = await analyzeMetafile(
            result.metafile
        );

        console.log("Analysis of build:", analysis);
    }

    console.log(
        `Compiled frontend in ${Date.now() - time}ms.`
    );
};

main();
