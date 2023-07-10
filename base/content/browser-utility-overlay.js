/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * @typedef {"current" | "tab" | "tabshifted" | "window" | "save"} LoadWhere
 * @typedef {import("third_party/dothq/gecko-types/lib/nsIWebNavigation").LoadURIOptions} LoadURIOptions
 * @typedef {import("third_party/dothq/gecko-types/lib").nsIURI} nsIURI
 */

var { NavigationHelper } = ChromeUtils.importESModule(
    "resource:///modules/NavigationHelper.sys.mjs"
);

var { BrowserUtils } = ChromeUtils.importESModule(
    "resource://gre/modules/BrowserUtils.sys.mjs"
);

/**
 * Converts a string to use kebab case
 * @param {string} str 
 * @returns {string}
 */
function convertToKebabCase(str) {
    return str.replace(
        /[A-Z]+(?![a-z])|[A-Z]/g,
        (subs, ofs) => (ofs ? "-" : "") + subs.toLowerCase()
    );
}

/**
 * Creates a HTML element tree
 * @param {string} tagName 
 * @param {{ [key: string]: any }} [attributes] 
 * @param {(HTMLElement | string)[]} [children] 
 * @returns 
 */
function html(
    tagName,
    attributes,
    ...children
) {
    attributes = attributes || {};
    children = children || [];

    const element =
        tagName == "fragment" ? document.createDocumentFragment() : document.createElement(tagName);

    if (tagName !== "fragment") {
        for (const [key, value] of Object.entries(attributes)) {
            /** @type {HTMLElement} */ (element)
                .setAttribute(
                    convertToKebabCase(key),
                    value
                );
        }
    }

    for (const child of children) {
        if (child instanceof HTMLElement) element.appendChild(child);
        else if (typeof child === "string") {
            const text = document.createTextNode(child);

            element.appendChild(text);
        }
    }

    return element;
}

/** @global */
function shim(name, props) {
    return new Proxy(
        {},
        {
            get(target, property) {
                console.debug(`${name}: Tried accessing getter '${property.toString()}'.`);

                return props && props[property.toString()]
                    ? props[property.toString()]()
                    : function () {
                        console.debug(
                            `${name}: Tried calling getter '${property.toString()}'.`
                        );

                        return null;
                    };
            },
            set(target, property, newValue) {
                console.debug(
                    `${name}: Tried updating setter '${property.toString()}' to '${newValue.toString()}'.`
                );
                return true;
            }
        }
    );
}

/** @global */
function shimFunction(name, returnValue) {
    return (...args) => {
        console.debug(`${name}: Tried calling '${name}'.`);

        return returnValue ? returnValue() : undefined;
    };
}

/**
 * Generates a unique ID based on the current time and Math.random
 * @global
 * @param {number} rounds
 */
function generateID(rounds = 4) {
    return [...Array(rounds)]
        .map((i) => Math.round(Date.now() + Math.random() * Date.now()).toString(36))
        .join("");
}

/**
 * Loads one or more URIs into a browser
 * @global
 * @param {string} urlString 
 * @param {any} triggeringPrincipal 
 * @param {any} csp 
 */
function loadOneOrMoreURIs(urlString, triggeringPrincipal, csp) {
    return NavigationHelper.loadOneOrMoreURIs(window, urlString, triggeringPrincipal, csp);
}

/**
 * Opens trusted link in a target
 * 
 * Identical to openLinkIn, but uses a **system** principal
 * @global
 * @param {string} url 
 * @param {LoadWhere} where 
 * @param {Partial<LoadURIOptions>} params 
 */
function openTrustedLinkIn(url, where, params) {
    NavigationHelper.openTrustedLinkIn(window, url, where, params);
}

/**
 * Opens web link in a target
 * 
 * Identical to openLinkIn, but uses a null principal
 * @global
 * @param {string} url 
 * @param {LoadWhere} where 
 * @param {Partial<LoadURIOptions>} params 
 */
function openWebLinkIn(url, where, params) {
    NavigationHelper.openWebLinkIn(window, url, where, params);
}

/**
 * Opens a link into a target
 * @global
 * @param {string} url 
 * @param {LoadWhere} where 
 * @param {Partial<LoadURIOptions>} params 
 */
function openLinkIn(url, where, params) {
    return NavigationHelper.openLinkIn(window, url, where, params);
}

/**
 * Used to determine where to open a link
 * 
 * This is here for historical reasons and is 
 * currently in the process of being cleaned up 
 * by Mozilla to use the BrowserUtils singleton.
 * 
 * See: https://bugzilla.mozilla.org/show_bug.cgi?id=1742889
 * @param {Event | Object} e
 * @param {boolean} ignoreButton 
 * @param {boolean} ignoreAlt 
 * @returns {LoadWhere}
 */
function whereToOpenLink(e, ignoreButton, ignoreAlt) {
    return BrowserUtils.whereToOpenLink(e, ignoreButton, ignoreAlt);
}

/**
 * Clamps a number between a min and max value
 * @param {number} value
 * @param {number} min
 * @param {number} max
 * @returns {number}
 * @global
 */
function clamp(value, min, max) {
    return Math.max(Math.min(Math.max(value, min), max), min);
}

/**
 * If a tab with a URI already exists, switch to it, 
 * otherwise open a new tab with the URI.
 * @param {string} url
 * @param {boolean} openNew 
 * @param {LoadURIOptions} openParams 
 */
function switchToTabHavingURI(url, openNew, openParams) {
    // todo: implement tab switching behaviour
    // for now, just load it in the current tab

    NavigationHelper.openLinkIn(window, url, "current", {
        triggeringPrincipal: Services.scriptSecurityManager.getSystemPrincipal(),
    });
}

/**
 * Private helper function for creating a 
 * null principal from a tab's user context ID
 * @param {BrowserTab} tab 
 * @private
 */
function _newNullPrincipalFromUserContextId(tab = window.gDot.tabs.selectedTab) {
    let userContextId;

    if (tab.hasAttribute("usercontextid")) {
        userContextId = tab.getAttribute("usercontextid");
    }

    return Services.scriptSecurityManager.createNullPrincipal({
        userContextId,
    });
}