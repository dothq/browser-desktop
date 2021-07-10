const { resolve } = require("path");

module.exports = {
    entry: "./base/index.tsx",
    mode: "development",
    devtool: "inline-source-map",
    module: {
        rules: [
            {
                test: /\.(tsx|ts)?$/,
                use: "ts-loader",
                exclude: /node_modules/,
            },
        ],
    },
    resolve: {
        extensions: [".tsx", ".ts", ".js"],
    },
    output: {
        filename: "bundle.js",
        path: resolve(__dirname, "dist"),
    },
};