import { FluentBundle, FluentResource } from "@fluent/bundle";
import { dot } from "../../api";
import { Cc, Ci } from "../../modules";
import { exportPublic } from "../../shared/globals";
import { loader } from "./loader";
import { getL10nDirectory } from "./util";

class L10n {
    public data: { [key: string]: FluentBundle } = {};

    // THIS SHOULD NEVER CHANGE.
    public defaultLocale = "en-GB";

    public format(id: string, ctx?: Record<string, any>) {
        const language = dot.utilities.browserLanguage;
        let bundle = this.data[language];

        // Check if the bundle exists first, if it doesn't just fallback to the default language.
        if (!bundle) bundle = this.data[this.defaultLocale];
        // Last resort, just return the ID of the string.
        if (!bundle) return id;

        const raw = bundle.getMessage(id);

        if (raw) {
            if (Object.keys(raw.attributes).length !== 0) {
                const formattedAttributes: any = {};

                for (const [key, value] of Object.entries(raw.attributes)) {
                    formattedAttributes[key] = bundle.formatPattern(
                        value,
                        ctx
                    )
                }

                return {
                    value: raw.value ? bundle.formatPattern(
                        raw.value,
                        ctx
                    ) : undefined,
                    attributes: formattedAttributes
                }
            } else if (raw.value) {
                return bundle.formatPattern(
                    raw.value,
                    ctx
                );
            } else {
                return id;
            }
        } else {
            console.error(`L10n string with id ${id} not found in ${language}.`)
        }
    }

    private async load() {
        const dir = Cc["@mozilla.org/file/local;1"].createInstance(Ci.nsIFile);
        if (dir) {
            dir.initWithPath(
                getL10nDirectory()
            );
        }

        for await (const locale of dir.directoryEntries) {
            if (locale.isDirectory()) {
                const ftl = await loader(
                    getL10nDirectory(),
                    locale.leafName
                );

                const bundle = new FluentBundle(locale.leafName);
                const resource = new FluentResource(ftl);
                const errors = bundle.addResource(resource);

                if (errors.length) {
                    for (const e of errors) {
                        console.warn(`Failed to load ${locale.leafName}`, e);
                    }
                }

                if (bundle.getMessage("language-full-name")) {
                    this.data[locale.leafName] = bundle;
                } else {
                    console.warn(`Failed to load ${locale.leafName} because the manifest doesn't exist or is corrupt.`)
                }
            }
        }
    }

    constructor() {
        this.load();
    }
}

export const l10n = new L10n();
exportPublic("l10n", l10n);