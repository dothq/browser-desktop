/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * @typedef {"current" | "tab" | "tabshifted" | "window" | "save"} LoadWhere
 * @typedef {import("third_party/dothq/gecko-types/lib/nsIWebNavigation").LoadURIOptions} LoadURIOptions
 */

var { NavigationHelper } = ChromeUtils.importESModule(
    "resource:///modules/NavigationHelper.sys.mjs"
);

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
            /** @type {HTMLElement} */ (element).setAttribute(key, value);
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