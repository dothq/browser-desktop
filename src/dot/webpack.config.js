const { resolve } = require("path");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const { glob } = require("glob");

const scss = glob.sync(resolve(__dirname, "{,!(node_modules)/**}", "*.scss"));

module.exports = {
    target: "web",
    entry: {
        browser: ["./app/index.tsx", ...scss]
    },
    mode: "development",
    devtool: "inline-source-map",
    module: {
        rules: [
            {
                test: /\.(ts)x?$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: ["@babel/preset-env", "@babel/preset-typescript", "babel-preset-solid"],
                        plugins: [
                            "@babel/plugin-transform-runtime",
                            ["@babel/plugin-proposal-decorators", { legacy: true }]
                        ]
                    }
                }
            },
            {
                test: /\.scss$/,
                use: [MiniCssExtractPlugin.loader, "css-loader", "sass-loader"]
            },
        ],
    },
    resolve: {
        extensions: [".tsx", ".ts", ".js"],
    },
    plugins: [
        new MiniCssExtractPlugin(),
        new CleanWebpackPlugin()
    ],
    output: {
        filename: "[name].js",
        path: resolve(__dirname, "dist"),
    }
};