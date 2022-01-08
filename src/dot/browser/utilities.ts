import { Browser } from "index";
import { AppConstants, Cc, Ci } from "mozilla";

enum Platform {
    Windows = "window",
    macOS = "macos",
    Linux = "linux"
}

export class BrowserUtilities {
    public get platform() {
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

    public constructor(private browser: Browser) {}
}
