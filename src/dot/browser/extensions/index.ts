import { Browser } from "index";
import { AddonManager, NetUtil } from "mozilla";
import { COMMENT_REGEX } from "shared/regex";
import { BuiltInExtensions } from "./built-in";
import { ExtensionManifest } from "./manifest";

class BrowserExtensions {
    public loadBuiltInExtensions() {
        for (const {
            id,
            version,
            mount
        } of BuiltInExtensions) {
            AddonManager.maybeInstallBuiltinAddon(
                id,
                version.toString(),
                mount
            );
        }
    }

    public async loadManifest(
        id: string
    ): Promise<ExtensionManifest> {
        return new Promise(async (resolve, reject) => {
            const addon = await AddonManager.getAddonByID(
                id
            );

            const manifestPath = addon.getResourceURI(
                "manifest.json"
            ).spec;

            NetUtil.asyncFetch(
                {
                    uri: manifestPath,
                    loadUsingSystemPrincipal: true
                },
                (inputStream: any, status: any) => {
                    try {
                        const data =
                            NetUtil.readInputStreamToString(
                                inputStream,
                                inputStream.available(),
                                { charset: "utf-8" }
                            ).replace(
                                COMMENT_REGEX,
                                "$1"
                            );

                        resolve(JSON.parse(data));
                    } catch (e) {
                        reject(e);
                    }
                }
            );
        });
    }

    public constructor(private browser: Browser) {
        this.loadBuiltInExtensions();
    }
}

export default BrowserExtensions;