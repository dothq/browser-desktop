import { Cc, Ci, Services } from "../../modules";
import { MozURI } from "../../types/uri";

export const getL10nDirectory = () => {
    const root: MozURI = Cc[
        "@mozilla.org/chrome/chrome-registry;1"
    ]
        .getService(Ci.nsIChromeRegistry)
        .convertChromeURL(
            Services.io.newURI(
                "chrome://dot/content/l10n"
            )
        );

    return root.filePath;
};
