const { resolve } = require("path");
const webpack = require("webpack");
const rimraf = require("rimraf");

const config = {
    name: "ui",
    entry: resolve(process.cwd(), "ui", "ui.scss"),
    mode: "none",
    output: {
        path: resolve(process.cwd(), "ui", "data")
    },
    resolve: {
        extensions: [".scss"]
    },
    module: {
        rules: [
            {
                test: /\.scss$/i,
                exclude: /\.js$/i,
                use: [
                    {
                        loader: "file-loader",
                        options: {
                            name: "dotui.inc.css"
                        }
                    },
                    {
                        loader: "extract-loader"
                    },
                    {
                        loader: "css-loader?-url"
                    },
                    {
                        loader: "sass-loader"
                    }
                ]
            }
        ]
    },
    plugins: [
        new webpack.BannerPlugin(`
# This file is compiled by webpack from ui/ui.scss.
# You should probably be modifying that instead.
        `)
    ]
};

config.plugins.push({
    apply: (compiler) => {
        compiler.hooks.done.tap(
            "Compiled",
            (compilation) => {
                rimraf.sync(
                    resolve(
                        process.cwd(),
                        "ui",
                        "data",
                        "main.js"
                    )
                );
            }
        );
    }
});

module.exports = config;
