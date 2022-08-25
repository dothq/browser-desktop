import { resolve } from "path";
import * as url from "url";

import CopyPlugin from "copy-webpack-plugin";
import ReactRefreshPlugin from "@pmmmwh/react-refresh-webpack-plugin";
import TSReactRefresh from "react-refresh-typescript";
import CssMinimizerPlugin from "css-minimizer-webpack-plugin";
import MiniCssExtractPlugin from "mini-css-extract-plugin";
import TerserPlugin from "terser-webpack-plugin";

const __dirname = url.fileURLToPath(new URL(".", import.meta.url));

export default (emv, argv) => {
  const dev = argv.mode === "development";
  const prod = argv.mode === "production";

  return {
    entry: {
      main: "./src/main.tsx",
      devtools: dev
        ? "./src/devtools/development.ts"
        : "./src/devtools/production.ts",
    },
    output: {
      path: resolve(__dirname, "dist"),
      filename: "[name].js",
      clean: true,
    },
    devtool: dev ? "inline-source-map" : "source-map",
    devServer: {
      hot: true,
      allowedHosts: ["all"],
      devMiddleware: {
        writeToDisk: true,
      },
      client: {
        logging: "verbose",
      },
    },
    module: {
      rules: [
        {
          test: /\.tsx?$/,
          loader: "ts-loader",
          options: {
            getCustomTransformers: () => ({
              before: [dev && TSReactRefresh()].filter(Boolean),
            }),
            transpileOnly: true,
          },
        },
        {
          test: /\.css$/,
          use: [
            MiniCssExtractPlugin.loader,
            {
              loader: "css-loader",
              options: {
                importLoaders: 1,
                modules: true,
              },
            },
          ],
          include: /\.module\.css$/,
        },
        {
          test: /\.css$/,
          use: [MiniCssExtractPlugin.loader, "css-loader"],
          exclude: /\.module\.css$/,
        },
      ],
    },
    plugins: [
      dev &&
        new ReactRefreshPlugin({
          overlay: {
            sockPort: 8080,
            sockHost: "localhost",
            sockProtocol: "http",
          },
        }),
      new CopyPlugin({
        patterns: [{ from: "public" }],
      }),
      new MiniCssExtractPlugin(),
    ].filter(Boolean),
    resolve: {
      extensions: [".ts", ".tsx", ".js"],
    },
    experiments: {
      topLevelAwait: true,
    },

    optimization: prod
      ? {
          usedExports: true,
          minimizer: [new CssMinimizerPlugin(), new TerserPlugin()],
        }
      : {
          /* Dev is optimized */
        },
  };
};
