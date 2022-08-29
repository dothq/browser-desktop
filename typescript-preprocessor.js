const { build } = require("esbuild");

const chromeModules = {
	name: "chrome",
	setup(build) {
        let https = require('https')
        let http = require('http')
    
        // Intercept import paths starting with "http:" and "https:" so
        // esbuild doesn't attempt to map them to a file system location.
        // Tag them with the "http-url" namespace to associate them with
        // this plugin.
        build.onResolve({ filter: /^(chrome|resource)?:\/\// }, args => ({
          path: args.path,
          namespace: 'http-url',
        }))
    
        // We also want to intercept all import paths inside downloaded
        // files and resolve them against the original URL. All of these
        // files will be in the "http-url" namespace. Make sure to keep
        // the newly resolved URL in the "http-url" namespace so imports
        // inside it will also be resolved as URLs recursively.
        build.onResolve({ filter: /.*/, namespace: 'http-url' }, args => ({
          path: new URL(args.path, args.importer).toString(),
          namespace: 'http-url',
        }))
    
        // When a URL is loaded, we want to actually download the content
        // from the internet. This has just enough logic to be able to
        // handle the example import from unpkg.com but in reality this
        // would probably need to be more complex.
        build.onLoad({ filter: /.*/, namespace: 'http-url' }, async (args) => {
            const contents = `const mod = ChromeUtils.import(${JSON.stringify(args.path)});
module.exports = mod;`

          return { contents }
        })
	}
};

const main = async (path, outfile) => {
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
}

main(...process.argv.splice(2));