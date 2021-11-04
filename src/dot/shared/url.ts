import { AboutPagesUtils, Services } from "../modules";
import { exportPublic } from "./globals";
import { NEW_TAB_URL } from "./tab";

export const whitelistedSchemes = [
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
];

export const formatToParts = (
    url: string
): void | {
    scheme: string;
    domain: string;
    host: string;
    path: string;
    query: string;
    hash: string;
    internal: boolean;
} => {
    let location;

    try {
        location = Services.io.newURI(url);
    } catch (e) {
        return;
    }

    try {
        const isHttp = location.scheme.startsWith("http");
        const rootDomain = isHttp
            ? Services.eTLD.getBaseDomainFromHost(
                  location.host
              )
            : "";
        const notWhitelisted =
            !whitelistedSchemes.includes(location.scheme);
        const noTrailingPath =
            location.query.length == 0
                ? location.filePath.replace(/\/*$/, "")
                : location.filePath;

        const scheme = whitelistedSchemes.includes(
            location.scheme
        )
            ? `${location.scheme}://`
            : `${location.scheme}:`;

        return {
            scheme,
            domain: notWhitelisted
                ? location.pathQueryRef
                : rootDomain,
            host: notWhitelisted
                ? ""
                : location.host.replace(rootDomain, ""),
            path: notWhitelisted ? "" : noTrailingPath,
            query: notWhitelisted
                ? ""
                : location.query
                ? "?" + location.query
                : "",
            hash: notWhitelisted
                ? ""
                : location.ref
                ? "#" + location.ref
                : "",
            internal: !isHttp
        };
    } catch (e) {
        return;
    }
};

export const predefinedFavicons: any = {
    settings:
        "chrome://dot/content/skin/icons/settings.svg",
    config: "chrome://dot/content/skin/icons/settings.svg"
};

export const predefinedTitles: any = {
    "about:home": "New Tab",
    "about:newtab": "New Tab",
    "about:privatebrowsing": "Private Browsing"
};

export const visibleAboutUrls =
    AboutPagesUtils.visibleAboutUrls.map(
        (url: string) => {
            return Services.io.newURI(url).pathQueryRef;
        }
    );

export const isBlankPageURL = (url: string) =>
    url == "about:blank" ||
    url == "about:home" ||
    url == "about:welcome" ||
    url == NEW_TAB_URL;

exportPublic("isBlankPageURL", isBlankPageURL);
