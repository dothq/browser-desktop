import React from "react";
import { dot } from "../../api";
import { store } from "../../app/store";
import { SiteIdentityDialog } from "../../core/site-identity";
import { Services } from "../../modules";
import { MozURI } from "../../types/uri";
import { Identity } from "../Identity";

interface State {
    // 0: normal
    // 1: hovered
    // 2: focused
    mouseState: 0 | 1 | 2;
    isEmpty: boolean;
    identityDialogOpen: boolean;
    identityMsg: string;
    identityIcon: string;
}

interface Props {
    tabId: number
}

interface SearchbarPart {
    semihide: boolean;
    content: string;
}

export class Searchbar extends React.Component<Props> {
    public state: State = {
        mouseState: 0,
        isEmpty: true,
        identityDialogOpen: false,
        identityMsg: "",
        identityIcon: ""
    }

    public identityDialog = new SiteIdentityDialog();

    public get tab() {
        return dot.tabs.get(this.props.tabId);
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

    public constructor(props: Props) {
        super(props);

        store.subscribe(() => this.onLocationChange())
    }

    public onLocationChange() {
        const parsed = (this.tab?.urlParsed as MozURI);

        let protocol: Partial<SearchbarPart> = {};
        let subdomain: Partial<SearchbarPart> = {};
        let hostname: Partial<SearchbarPart> = {};
        let path: Partial<SearchbarPart> = {};
        let queryParams: Partial<SearchbarPart> = {};
        let hash: Partial<SearchbarPart> = {};

        // Locator schemes are schemes which end with ://
        // Examples of these are http, https, moz-extension and chrome
        if (this.knownLocatorSchemes.includes(parsed.scheme)) {
            protocol.content = `${parsed.scheme}://`
            protocol.semihide = true;

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
            path.content = parsed.filePath;
            path.semihide = true;
        } else {
            protocol.content = `${parsed.scheme}:`
            protocol.semihide = false;

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

        const data = this.tab?.identityManager.getIdentityStrings();

        this.setState({
            ...this.state,
            identityMsg: data?.msg,
            identityIcon: data?.icon
        })
    }

    public onIdentityClick() {
        if (this.identityDialog.opened) {
            this.setState({ ...this.state, identityDialogOpen: false });

            return this.identityDialog.close();
        }

        this.identityDialog.openAtElement(
            document.getElementById("identity-icon-box"),
            { tab: this.tab }
        );

        this.setState({
            ...this.state,
            identityDialogOpen: true,
        });
    }

    public render() {
        return (
            <div id={"urlbar"}>
                <div
                    id={"urlbar-background"}
                    data-hovered={this.state.mouseState == 1}
                    data-focused={this.state.mouseState == 2}
                ></div>

                <div id={"urlbar-input-container"}>
                    <div id={"identity-box"}>
                        <Identity
                            onClick={() => this.onIdentityClick()}
                            selected={this.state.identityDialogOpen}
                            type={this.state.identityIcon} />
                    </div>

                    <div
                        id={"urlbar-input"}
                    >
                        <div
                            id={"urlbar-input-url"}
                            style={{
                                opacity: true
                                    ? 0
                                    : 1
                            }}
                        >
                            <span
                                className={"scheme"}
                                data-hide-protocol={true}
                            >
                                { }
                            </span>
                            <span className={"host"}></span>
                            <span className={"domain"}></span>
                            <span className={"path"}></span>
                            <span className={"query"}></span>
                            <span className={"hash"}></span>
                        </div>
                        <input
                            id={"urlbar-input-box"}
                            placeholder={"Search using DuckDuckGo or enter address"}
                            style={{
                                opacity: true
                                    ? 1
                                    : 0
                            }}
                        ></input>
                    </div>
                </div>
            </div>
        )
    }
}