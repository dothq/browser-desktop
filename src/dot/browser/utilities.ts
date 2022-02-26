import { Browser } from "index";
import { AppConstants, Cc, Ci, Services } from "mozilla";
import { MozURI } from "types/uri";

export enum Platform {
    Windows = "window",
    macOS = "macos",
    Linux = "linux"
}

class BrowserUtilities {
    public get platform(): Platform {
        return AppConstants.platform == "macosx"
            ? Platform.macOS
            : AppConstants.platform == "win"
            ? Platform.Windows
            : AppConstants.platform;
    }

    public get desktopEnvironment() {
        if (this.platform !== Platform.Linux) return "";

        return this.env.get("XDG_CURRENT_DESKTOP");
    }

    public env = Cc[
        "@mozilla.org/process/environment;1"
    ].getService(Ci.nsIEnvironment);

    public genId(rounds: number = 4) {
        // https://github.com/dothq/id/blob/main/index.ts
        return [...Array(rounds)]
            .map((_) =>
                Math.round(
                    Date.now() +
                        Math.random() * Date.now()
                ).toString(36)
            )
            .join("");
    }

    public sleep(ms: number) {
        return new Promise<void>((resolve) => {
            setTimeout(() => {
                resolve();
            }, ms);
        });
    }

    public isJSON(data: any) {
        if (typeof data == "object") return true;

        let jsonParsed;

        try {
            jsonParsed = JSON.parse(data);
        } catch (e) {}

        // is JSON
        if (
            typeof data == "string" &&
            jsonParsed &&
            typeof jsonParsed == "object"
        ) {
            // return early
            return true;
        } else {
            return false;
        }
    }

    public isBlankPageURL(url: string) {
        return (
            url.startsWith("about:blank") ||
            url.startsWith("about:home") ||
            url.startsWith("about:welcome")
            /* todo: add BROWSER_NEW_TAB_URL url == BROWSER_NEW_TAB_URL */
        );
    }

    public doGetProtocolFlags(uri: MozURI) {
        const handler = Services.io.getProtocolHandler(
            uri.scheme
        );

        return handler instanceof
            Ci.nsIProtocolHandlerWithDynamicFlags
            ? handler
                  .QueryInterface(
                      Ci.nsIProtocolHandlerWithDynamicFlags
                  )
                  .getFlagsForURI(uri)
            : handler.protocolFlags;
    }

    public constructor(private browser: Browser) {}
}

export default BrowserUtilities;
