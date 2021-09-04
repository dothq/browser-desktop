import React from "react";
import { dot } from "../../api";
import { ipc } from "../../core/ipc";
import { l10n } from "../../core/l10n";
import { Services } from "../../modules";
import { MozURI } from "../../types/uri";

interface Props {
    tabId: number
}

interface SearchbarPart {
    id: string;
    semihide: boolean;
    content: string;
}

interface State {
    parts: SearchbarPart[],

    inputEdited: boolean,
    inputFocused: boolean,
    inputPlaceholder: string,
    inputChangedSinceOpening: boolean,

    searchType: number
}

enum SearchInput {
    Fake,
    Real
}

export class SearchbarInput extends React.Component<Props> {
    public tabId: number;

    public state: State = {
        parts: [],

        inputEdited: false,
        inputFocused: false,
        inputPlaceholder: "",
        inputChangedSinceOpening: false,

        searchType: SearchInput.Fake
    }

    public inputRef = React.createRef<HTMLInputElement>();

    public get tab() {
        return dot.tabs.get(this.tabId);
    }

    public update(key: string, val: any) {
        this.setState({
            ...this.state,
            [key]: val
        })
    }

    public get inputEdited() { return this.state.inputEdited }
    public set inputEdited(val: any) { this.update("inputEdited", val) }
    public get inputFocused() { return this.state.inputFocused }
    public set inputFocused(val: any) { this.update("inputFocused", val) }
    public get inputChangedSinceOpening() { return this.state.inputChangedSinceOpening }
    public set inputChangedSinceOpening(val: any) { this.update("inputChangedSinceOpening", val) }

    public get searchType() { return this.state.searchType }
    public set searchType(val: any) { this.update("searchType", val) }

    public get value() {
        return this.inputRef.current?.value;
    }

    public set value(val: any) {
        if (this.inputRef.current) {
            this.inputRef.current.value = val;
        }
    }

    // These are schemes that end in :// instead of :
    public knownLocatorSchemes = [
        "http",
        "https",
        "ws",
        "wss",
        "file",
        "ftp",
        "moz-extension",
        "chrome",
        "resource",
        "moz",
        "moz-icon",
        "moz-gio"
    ]

    public isHttp(scheme: string) {
        return scheme == "http" || scheme == "https";
    }

    public useHackyDomain(host: string) {
        const splitHost = host.split("/");
        const domain = splitHost[splitHost.length - 2];
        const tld = splitHost[splitHost.length - 1];

        return `${domain}.${tld}`;
    }

    public onLocationChange() {
        this.updateInputPlaceholder();

        // If the input is currently focused, we don't want to interrupt the state
        // of the input box. E.g. someone might be typing, and we wouldn't want to
        // reset the value of the input.
        if (this.inputFocused || this.inputChangedSinceOpening) return;

        const parsed = (this.tab?.urlParsed as MozURI);

        if (!parsed) return;

        let scheme: Partial<SearchbarPart> = { id: "scheme" };
        let subdomain: Partial<SearchbarPart> = { id: "host" };
        let hostname: Partial<SearchbarPart> = { id: "domain" };
        let path: Partial<SearchbarPart> = { id: "path" };
        let queryParams: Partial<SearchbarPart> = { id: "query" };
        let hash: Partial<SearchbarPart> = { id: "hash" };

        // Locator schemes are schemes which end with ://
        // Examples of these are http, https, moz-extension and chrome
        if (this.knownLocatorSchemes.includes(parsed.scheme)) {
            scheme.content = `${parsed.scheme}://`
            scheme.semihide = true;

            // Only http schemes should have their hosts resolved
            if (this.isHttp(parsed.scheme)) {
                // Try to resolve the base domain of the host
                try {
                    const domainName = Services.eTLD.getBaseDomainFromHost(parsed.host);

                    // The subdomain is the host without the domain name
                    // Example: example.mysite.com
                    // The domain name is "mysite.com"
                    // So to get the subdomain we just split the host at "mysite.com"
                    // Leaving us with "example." as the subdomain
                    subdomain.content = parsed.host.split(domainName)[0];
                    hostname.content = domainName;
                } catch (e) {
                    // That didn't work so let's just use our hacky domain thing
                    hostname.content = this.useHackyDomain(parsed.host);
                }

                // We do this so it is clear what is the URL
                // For example paypal-com.fakebank.com is quite misleading
                // So we decrease the opacity of "paypal-com."
                // And make sure "fakebank.com" is fully visible and readable
                subdomain.semihide = true;
                hostname.semihide = false;
            } else {
                // We're probably using a scheme like chrome:// or resource://
                // chrome://dot/content/browser.html
                //         [dot] is the host
                //            [/content/browser.html] is the path
                hostname.content = parsed.host;
            }

            // filePath excludes query and hash as we handle that later
            path.content = parsed.filePath.replace(/^\/{1}$/, "");
            path.semihide = true;
        } else {
            scheme.content = `${parsed.scheme}:`
            scheme.semihide = false;

            hostname.content = parsed.filePath;
            hostname.semihide = false;

            // We can skip the path for non locator schemes
            // We will need to have the query and hash though
        }

        // All scheme types have query and hash
        queryParams.content = parsed.query ? `?${parsed.query}` : undefined;
        hash.content = parsed.ref ? `#${parsed.ref}` : undefined;

        queryParams.semihide = true;
        hash.semihide = true;

        this.update("parts", [
            { ...scheme },
            { ...subdomain },
            { ...hostname },
            { ...path },
            { ...queryParams },
            { ...hash }
        ]);

        this.value = parsed.spec;
    }

    public onTabReload() {
        // Reset everything
        this.inputChangedSinceOpening = false;
    }

    public onInputFocus() {
        this.inputFocused = true;
    }

    public onInputBlur() {
        this.inputFocused = false;

        // If the input value has changed since we focused it
        // We should retain the real input instead of returning
        // to the fake input.
        if (this.inputChangedSinceOpening) {
            // Keep the real input
            this.searchType = SearchInput.Real;
            this.inputChangedSinceOpening = true; // The input is still in the changing phase
        } else {
            // Return to fake input
            this.searchType = SearchInput.Fake;
            this.inputChangedSinceOpening = false;
        }
    }

    public onInputChange() {
    }

    public onInputKeyDown(e: KeyboardEvent) {
        // Ignore any arrow events and enter
        // As those don't count towards the value changing
        if (
            e.code.startsWith("Arrow") ||
            e.code == "Enter"
        ) return;

        // The input value has changed
        // Avoid setting the value on every key
        if (!this.inputChangedSinceOpening) {
            this.inputChangedSinceOpening = true;
        }
    }

    public updateInputPlaceholder() {
        const engine = dot.search
            .providers
            .engine
            .currentSearchEngine;

        const engineName = engine.name;

        const localised = l10n.format(
            "searchbar-input-placeholder",
            { "engine-name": engineName }
        );

        const value = typeof (localised) == "object" ? localised.value : localised;

        this.update("inputPlaceholder", value);
    }

    constructor(props: Props) {
        super(props);

        this.tabId = props.tabId;

        ipc.on(
            `location-change`,
            () => {
                this.onLocationChange()
            }
        );

        ipc.on(
            `page-reload-${props.tabId}`,
            () => {
                this.onTabReload()
            }
        );
    }

    public render() {
        return (
            <>
                <div
                    id={"urlbar-input-url"}
                    hidden={this.searchType == SearchInput.Real}
                >
                    {this.state.parts.map(part => (
                        <span
                            className={part.id}
                            key={part.id}
                            style={{ opacity: part.semihide ? 0.5 : 1 }}
                        >
                            {part.content}
                        </span>
                    ))}
                </div>

                <input
                    id={"urlbar-input-box"}
                    placeholder={this.state.inputPlaceholder}
                    ref={this.inputRef}
                    hidden={this.searchType == SearchInput.Fake}
                    /* Events */
                    onFocus={() => this.onInputFocus}
                    onBlur={() => this.onInputBlur}
                    onChange={() => this.onInputChange}
                    onKeyDown={() => this.onInputKeyDown}
                ></input>
            </>
        )
    }
}