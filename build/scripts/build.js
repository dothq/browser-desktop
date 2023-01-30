/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at <http://mozilla.org/MPL/2.0/>. */

/* Borrowed from devtools build.js, tweaked to use esbuild */

/* Usage:  node build.js [LIST_OF_SOURCE_FILES...] OUTPUT_DIR
 *    Compiles all source files and places the results of the compilation in
 * OUTPUT_DIR.
 */

"use strict";

const { build } = require("esbuild");
const fs = require("fs");
const _path = require("path");

let relativePathCheckerPlugin = {
    name: "relative-path-checker",
    setup(build) {
        build.onResolve({ filter: /.*/ }, args => {
            if (args.importer) {
                let path = args.path;
                const ext = _path.parse(args.path).ext;

                if (ext.length) {
                    if (ext == ".ts") {
                        path.replace(".ts", ".js");
                    }
                } else {
                    path = path + ".js"
                }

                return { path, external: true }
            }
        })
    },
}

function transform(inPath, outPath) {
    let out;
    try {
        out = build({
            entryPoints: [inPath],
            bundle: true,
            format: "esm",
            treeShaking: false,
            minify: false,
            platform: "browser",
            target: "firefox100",
            jsx: "transform",
            sourcemap: "inline",
            plugins: [relativePathCheckerPlugin],
            outfile: outPath
        })
    } catch (err) {
        throw new Error(`
========================
NODE COMPILATION ERROR!

File:   ${inPath}
Stack:

${err.stack}

========================
`);
    }

    return;
}

// fs.mkdirSync's "recursive" option appears not to work, so I'm writing a
// simple version of the function myself.
function mkdirs(filePath) {
    if (fs.existsSync(filePath)) {
        return;
    }
    mkdirs(_path.dirname(filePath));
    try {
        fs.mkdirSync(filePath);
    } catch (err) {
        // Ignore any errors resulting from the directory already existing.
        if (err.code != "EEXIST") {
            throw err;
        }
    }
}

const deps = [__filename];
const outputDir = process.argv[process.argv.length - 1];
mkdirs(outputDir);

for (let i = 2; i < process.argv.length - 1; i++) {
    const inPath = process.argv[i];
    const outPath = _path.join(outputDir, _path.basename(inPath).replace(/\.ts(x)?/, ".js"));

    transform(inPath, outPath);

    deps.push(inPath);
}

// Print all dependencies prefixed with 'dep:' in order to help node.py, the script that
// calls this module, to report back the precise list of all dependencies.
console.log(deps.map(file => "dep:" + file.replace(/\.ts/, ".js")).join("\n"));