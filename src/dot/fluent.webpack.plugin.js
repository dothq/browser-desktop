const { readFileSync } = require("fs");
const { glob } = require("glob");
const { resolve } = require("path");

class FluentPlugin {
    constructor(options = {}) {
        this.options = options;
    }

    apply(compiler) {
        const pluginName = FluentPlugin.name;

        const { webpack } = compiler;
        const { Compilation } = webpack;
        const { RawSource } = webpack.sources;

        compiler.hooks.thisCompilation.tap(
            pluginName,
            (compilation) => {
                compilation.hooks.processAssets.tap(
                    {
                        name: pluginName,
                        stage: Compilation.PROCESS_ASSETS_STAGE_SUMMARIZE
                    },
                    (assets) => {
                        const configs = glob.sync(
                            resolve(
                                __dirname,
                                "{,!(node_modules)/**}",
                                ".ftlconfig"
                            )
                        );

                        const structure = [];

                        for (const configPath of configs) {
                            const config = JSON.parse(
                                readFileSync(
                                    configPath,
                                    "utf-8"
                                )
                            );

                            const l10nSplit = configPath
                                .split("/.ftlconfig")[0]
                                .split("/");
                            const l10nId =
                                l10nSplit[
                                    l10nSplit.length - 1
                                ];
                            const l10nDirectory = resolve(
                                configPath.split(
                                    "/.ftlconfig"
                                )[0]
                            );

                            const ftl = glob.sync(
                                resolve(
                                    l10nDirectory,
                                    "**",
                                    "*.ftl"
                                )
                            );

                            structure.push({
                                id: l10nId,
                                name: config.name,
                                l10n: ftl
                            });
                        }

                        compilation.emitAsset(
                            "l10n.json",
                            new RawSource(
                                JSON.stringify(
                                    structure,
                                    null,
                                    2
                                )
                            )
                        );

                        for (const struct of structure) {
                            let data = `# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at http://mozilla.org/MPL/2.0/.`;

                            data += `\n\nlanguage-id = ${struct.id}\nlanguage-name = ${struct.name}\n\n`;

                            for (const lang of struct.l10n) {
                                const langRaw =
                                    readFileSync(
                                        lang,
                                        "utf-8"
                                    );

                                data += `# ${
                                    lang.split(
                                        __dirname
                                    )[1]
                                }\n\n${langRaw}`;
                            }

                            compilation.emitAsset(
                                `${struct.id}.ftl`,
                                new RawSource(data)
                            );
                        }
                    }
                );
            }
        );
    }
}

module.exports = FluentPlugin;
