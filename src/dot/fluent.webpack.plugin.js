const { readFileSync, readdirSync } = require("fs");
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
                        const l10nPath = resolve(
                            __dirname,
                            "l10n"
                        );

                        const languages = readdirSync(l10nPath, { withFileTypes: true })
                            .filter(i => i.isDirectory())
                            .map(i => i.name)

                        for(const lang of languages) {
                            let strings = glob.sync(`${l10nPath}/${lang}/**/*.ftl`)
                            strings = strings.sort((a, b) => a.split("/").length - b.split("/").length)
                        
                            let data =
`# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at http://mozilla.org/MPL/2.0/.

# THIS FILE IS AUTO-GENERATED. DO NOT EDIT.`;
                        
                            for (const str of strings) {
                                const ftl = readFileSync(str, "utf-8")
                        
                                data += `\n\n# ${str.replace(`${l10nPath}/${lang}/`, "")}\n\n${ftl}`
                            }

                            compilation.emitAsset(
                                `${lang}.ftl`,
                                new RawSource(data)
                            );

                            console.log(`dot/l10n/${lang}`)
                        }
                    }
                );
            }
        );
    }
}

module.exports = FluentPlugin;
