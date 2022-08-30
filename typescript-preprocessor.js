const { build } = require("esbuild");
const tsc = require("typescript");
const { readFile } = require("fs");

const chromeModules = {
	name: "chrome",
	setup(build) {
        build.onResolve({ filter: /^(chrome|resource)?:\/\// }, args => ({
            path: args.path,
            namespace: "chrome",
        }))
    
        build.onResolve({ filter: /.*/, namespace: "chrome" }, args => ({
            path: new URL(args.path, args.importer).toString(),
            namespace: "chrome",
        }))
    
        build.onLoad({ filter: /.*/, namespace: "chrome" }, async (args) => {
            const contents = [
                "const mod = ChromeUtils.import(${JSON.stringify(args.path)});",
                "module.exports = mod;"
            ].join("\n").trim();

            return { contents }
        })
	}
};

const main = async (path, outfile, tsconfig) => {
    await build({
        entryPoints: [path],
        bundle: true,
        platform: "browser",
        plugins: [chromeModules],
        sourcemap: "inline",
        outfile,
        target: [
            "es2022",
            "firefox100"
        ],
        write: true
    });

    const content = await readFile(path, "utf-8");

    tsc.transpileModule(content, {
        compilerOptions: {
            noEmit: true,
            project: tsconfig
        }
    })
}

main(...process.argv.splice(2));