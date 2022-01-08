import {
    FluentBundle,
    FluentResource,
    FluentVariable
} from "@fluent/bundle";
import { Message, Pattern } from "@fluent/bundle/esm/ast";
import { exportPublic } from "../shared/globals";

class L10nService {
    // THIS SHOULD NEVER CHANGE.
    public defaultLocale = "en-GB";

    private _initted: boolean = false;

    private _resource: FluentResource | undefined;
    private _bundle: FluentBundle | undefined;

    public get resource(): FluentResource {
        if (this._resource) return this._resource;
        else return null as any;
    }

    public get bundle(): FluentBundle {
        if (this._bundle) return this._bundle;
        else return null as any;
    }

    public set resource(data: FluentResource) {
        this._resource = data;
    }
    public set bundle(data: FluentBundle) {
        this._bundle = data;
    }

    public ts(
        str: string,
        ctx?: Record<string, FluentVariable>
    ): string {
        try {
            const msg = this.bundle.getMessage(str);

            if (msg && msg.value) {
                return msg.value.toString();
            } else {
                return str;
            }
        } catch (e) {
            console.warn(e);

            return str;
        }
    }

    public t(
        str: string,
        ctx?: Record<string, FluentVariable>
    ): string | Record<string, Pattern> | undefined {
        try {
            const msg = this.bundle.getMessage(str);

            if (msg) {
                if (msg.value)
                    return this.formatValue(msg, ctx);
                if (msg.attributes)
                    return this.formatAttributes(
                        msg,
                        ctx
                    );
            } else {
                return str;
            }
        } catch (e) {
            console.warn(e);

            return str;
        }
    }

    private formatValue(
        msg: Message,
        ctx?: Record<string, FluentVariable>
    ): any {
        if (!msg || !msg.value) return;

        return this.bundle.formatPattern(msg.value, ctx);
    }

    private formatAttributes(
        msg: Message,
        ctx?: Record<string, FluentVariable>
    ): any {
        if (!msg || !msg.attributes) return;

        const data: any = { attributes: {} };

        if (msg.value) data.value = msg.value;

        for (const [key, value] of Object.entries(
            msg.attributes
        )) {
            const parsed = Array.isArray(value)
                ? value.join("")
                : value;

            data.attributes[key] =
                this.bundle.formatPattern(parsed, ctx);
        }

        return data;
    }

    private async tryFetchFtl(
        language: string,
        fallback: string
    ) {
        let res: any;

        try {
            const req = await fetch(
                `chrome://dot/content/build/${language}.ftl`
            );
            res = await req.text();
        } catch (e) {
            console.warn(
                `Unable to load ${language}, falling back to ${fallback}!`
            );
            const req = await fetch(
                `chrome://dot/content/build/${fallback}.ftl`
            );
            res = await req.text();
        }

        if (res && res.length) return res;
        else
            throw new Error(
                `Failed to initialise L10n service, no available languages.`
            );
    }

    public async init() {
        if (this._initted)
            return console.error(
                `Cannot reinitialise L10n service.`
            );

        const language =
            this
                .defaultLocale; /* dot.utilities.browserLanguage */
        const ftl = await this.tryFetchFtl(
            language,
            this.defaultLocale
        );

        this.resource = new FluentResource(ftl);
        this.bundle = new FluentBundle([language]);

        this.bundle.addResource(this.resource);
    }

    public constructor() {
        // We need to do this as the Dot APIs aren't ready when we init
        window.addEventListener(
            "load",
            () => {
                this.init();
                this._initted = true;
            },
            { once: true }
        );
    }
}

// Create the singleton so we don't need to reinit twice
const L10n = new L10nService();

export default L10n;
exportPublic("L10n", L10n);
