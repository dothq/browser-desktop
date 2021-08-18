const { resolve } = require("path");
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const { glob } = require("glob");
const FluentPlugin = require("./fluent.webpack.plugin");

const scss = glob.sync(resolve(__dirname, "{,!(node_modules)/**}", "*.scss"));

const browser_styles = scss
    .filter(s => !s.split("/")[s.split("/").length - 1].includes(".webui.scss"));

const webui_styles = scss
    .filter(s => !browser_styles.includes(s));

const recursiveIssuer = (m, c) => {
    const issuer = c.moduleGraph.getIssuer(m);
    // For webpack@4 issuer = m.issuer

    if (issuer) {
        return recursiveIssuer(issuer, c);
    }

    const chunks = c.chunkGraph.getModuleChunks(m);
    // For webpack@4 chunks = m._chunks

    for (const chunk of chunks) {
        return chunk.name;
    }

    return false;
}

const webuiEntry = {
    newtab: "./resources/newtab/start-page.tsx"
}

let entry = {};
let cacheGroups = {};

Object.entries(webuiEntry).forEach(([key, value]) => {
    entry[key] = [
        value,
        ...glob.sync(
            resolve(
                __dirname,
                value.substring(0, value.lastIndexOf("/")),
                "{,!(node_modules)/**}",
                `*.scss`
            )
        ).map(x => x.replace(__dirname, "."))
    ];

    cacheGroups[`${key}Styles`] = {
        name: `${key}.chunk`,
        test: (m, c, entry = key) =>
            m.constructor.name === "CssModule" &&
            recursiveIssuer(m, c) === entry,
        chunks: "all",
        enforce: true,
    };
})

entry = {
    ...entry,
    browser: [
        "./app/index.tsx",
        ...browser_styles
    ],
    webui: [
        ...webui_styles
    ]
};

cacheGroups = {
    ...cacheGroups,
    browserStyles: {
        name: "browser.chunk",
        test: (m, c, entry = "browser") =>
            m.constructor.name === "CssModule" &&
            recursiveIssuer(m, c) === entry,
        chunks: "all",
        enforce: true,
    },
    webuiStyles: {
        name: "webui.chunk",
        test: (m, c, entry = "webui") =>
            m.constructor.name === "CssModule" &&
            recursiveIssuer(m, c) === entry,
        chunks: "all",
        enforce: true,
    }
};

module.exports = {
    target: "web",
    entry,
    mode: "development",
    devtool: "inline-source-map",
    module: {
        rules: [
            {
                test: /\.(ts)x?$/,
                exclude: /node_modules/,
                use: "ts-loader"
            },
            {
                test: /\.scss$/,
                use: [MiniCssExtractPlugin.loader, "css-loader", "sass-loader"],
            },
            {
                test: /\.js/,
                include: /@fluent[\\/](bundle|langneg|syntax|react|sequence)[\\/]/,
                type: "javascript/auto",
            },
            {
                test: /\.ftl/,
                exclude: /node_modules/,
                use: "fluent-loader"

            }
        ],
    },
    resolve: {
        extensions: [".tsx", ".ts", ".js"],
    },
    plugins: [
        new MiniCssExtractPlugin({
            filename: "[name].css"
        }),
        new CleanWebpackPlugin(),
        new FluentPlugin()
    ],
    output: {
        filename: "[name].js",
        path: resolve(__dirname, "dist"),
    },
    optimization: {
        splitChunks: {
            cacheGroups
        },
    },
};