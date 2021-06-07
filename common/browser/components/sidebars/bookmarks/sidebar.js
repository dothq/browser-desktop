/* This Source Code Form is subject to the terms of the Mozilla Public
   License, v. 2.0. If a copy of the MPL was not distributed with this
   file, You can obtain one at http://mozilla.org/MPL/2.0/. 
*/

const { Services } = ChromeUtils.import("resource://gre/modules/Services.jsm");
var { XPCOMUtils } = ChromeUtils.import(
    "resource://gre/modules/XPCOMUtils.jsm"
);

XPCOMUtils.defineLazyModuleGetters(this, {
    PlacesUtils: "resource://gre/modules/PlacesUtils.jsm",
    PlacesUIUtils: "resource:///modules/PlacesUIUtils.jsm",
    PlacesTransactions: "resource://gre/modules/PlacesTransactions.jsm",
    PrivateBrowsingUtils: "resource://gre/modules/PrivateBrowsingUtils.jsm",
});

class Bookmarks {
    data = {}

    ROOT_GUID = "root________"

    BOOKMARKS_MENU_GUID = "menu________"
    BOOKMARKS_BAR_GUID = "toolbar_____"
    BOOKMARKS_OTHER_GUID = "unfiled_____"
    BOOKMARKS_MOBILE_GUID = "mobile______"

    _faviconCache = null;

    favicons = {
        getMeOut: this,

        add(iconURL, data) {
            this.getMeOut._faviconCache[iconURL] = data;
        },

        async get(iconURL) {
            const match = await this.getMeOut._faviconCache[iconURL];

            if (typeof (match) !== "undefined") return match;
            else await this.getMeOut.downloadFavicon(iconURL);
        }
    }

    get bookmarksEl() {
        if (!_bookmarksEl) return null;

        return (this._bookmarksEl = document.getElementById("bookmarks"));
    }

    _bookmarksEl = null

    dataTypes = {
        "text/x-moz-place": "bookmark",
        "text/x-moz-place-container": "folder"
    }

    constructor() {
        console.log("---")

        this._faviconCache = {};

        this.init().then(data => {
            this.data = data;

            const applyMouseOver = ["bookmarksBar", "bookmarksMenu", "bookmarksUnfiled"];

            applyMouseOver.forEach(m => {
                var el = document.getElementById(m).querySelector("button.bookmark-item-context.folder");

                el.addEventListener("mouseover", () => {
                    PlacesUIUtils.setMouseoverURL(el.getAttribute("label"), windowRoot.ownerGlobal);
                });

                el.addEventListener("mouseleave", () => {
                    PlacesUIUtils.setMouseoverURL("", windowRoot.ownerGlobal);
                })
            })

            const bookmarksBar = this.data.children.find(i => i.guid == this.BOOKMARKS_BAR_GUID);
            const bookmarksMenu = this.data.children.find(i => i.guid == this.BOOKMARKS_MENU_GUID);
            const bookmarksUnfiled = this.data.children.find(i => i.guid == this.BOOKMARKS_OTHER_GUID);

            this.renderTree(bookmarksBar, document.getElementById(`bookmarksBar-children`));
            this.renderTree(bookmarksMenu, document.getElementById(`bookmarksMenu-children`));
            this.renderTree(bookmarksUnfiled, document.getElementById(`bookmarksUnfiled-children`));
        })
    }

    init() {
        return new Promise((resolve) => {
            console.time("Loading")

            PlacesUtils.promiseBookmarksTree(this.ROOT_GUID)
                .then(data => {
                    resolve(data);

                    console.timeEnd("Loading")
                })
        })
    }

    renderTree(data, parent) {
        if (data == {} || !data.children) return;

        data.children.forEach(child => {
            const childParent = document.createElement("div");

            childParent.id = child.guid;
            childParent.classList.add("bookmark-item")

            const childNode = document.createElement("button");

            const nodeChevron = document.createElement("i");

            const itemType = this.dataTypes[child.type];

            childNode.classList.add("bookmark-item-context");
            childNode.classList.add(itemType);
            childNode.id = `${child.guid}-context`;
            if (itemType == "folder") childNode.onclick = () => this.handleBookmarkItemClick(childParent, nodeChevron);
            else childNode.onmouseup = (e) => {
                const isAllowed = e.button < 2;
                const isMiddleClick = e.button == 1;

                if (isAllowed) this.openLink(child.uri, isMiddleClick)
            }
            childNode.setAttribute("bookmark-data", JSON.stringify(child))
            childNode.onmouseover = () => PlacesUIUtils.setMouseoverURL(itemType == "folder" ? child.title : child.uri, windowRoot.ownerGlobal);
            childNode.onmouseleave = () => PlacesUIUtils.setMouseoverURL("", windowRoot.ownerGlobal);

            nodeChevron.classList.add("bookmark-item-chevron");

            if (itemType !== "folder") nodeChevron.style.opacity = "0";

            const nodeIcon = document.createElement("i");

            nodeIcon.classList.add("bookmark-item-icon");

            if (itemType == "bookmark") {
                nodeIcon.style.setProperty("--bookmark-item-icon", `url(chrome://mozapps/skin/places/defaultFavicon.svg)`)

                if (child.uri)
                    PlacesUtils.promiseFaviconData(child.uri)
                        .then(({ data, mimeType }) => {
                            const icon = `data:${mimeType};base64,${this.arrayBufferToBase64(data)}`;

                            nodeIcon.style.setProperty("--bookmark-item-icon", `url(${icon})`)
                        })

            } else if (itemType == "folder") {
                nodeIcon.style.setProperty("--bookmark-item-icon", `url(chrome://browser/skin/folder.svg)`)
            }

            const nodeText = document.createElement("span");

            nodeText.classList.add("bookmark-item-text");
            nodeText.innerText = child.title;

            const nodeContainer = document.createElement("div");

            nodeContainer.classList.add("bookmark-item-children");

            childNode.appendChild(nodeChevron);
            childNode.appendChild(nodeIcon);
            childNode.appendChild(nodeText);

            childParent.appendChild(childNode);
            childParent.appendChild(nodeContainer);
            parent.appendChild(childParent);

            if (child.children && child.children.length !== 0) {
                this.renderTree(child, nodeContainer);
            }
        })
    }

    renderChild(data) {

    }

    getType(mime) {
        return this.dataTypes[mime];
    }

    getIconURL(data) {
        let chromeURLPrefix = "chrome://browser/skin/";

        if (data.iconURL) return data.iconURL;
        else if (data.type == "folder") {
            switch (data.id) {
                case this.BOOKMARKS_BAR_GUID:
                    return chromeURLPrefix + "bookmarks-toolbar.svg"
                case this.BOOKMARKS_MENU_GUID:
                    return chromeURLPrefix + "bookmarks-menu.svg"
                case this.BOOKMARKS_OTHER_GUID:
                    return chromeURLPrefix + "bookmarks-other.svg"
                case this.BOOKMARKS_MOBILE_GUID:
                    return chromeURLPrefix + "device-phone.svg"
                case this.ROOT_GUID:
                    return chromeURLPrefix + "home.svg"
                default:
                    return chromeURLPrefix + "folder.svg"
            }
        } else {
            return chromeURLPrefix + "bookmark-hollow.svg"
        }
    }

    toISO(unix) {
        return (new Date(unix / 1000)).toISOString();
    }

    handleBookmarkItemClick(el, chevron) {
        const isOpen = el.getAttribute("open");

        if (isOpen) {
            el.removeAttribute("open");
            chevron.style.transform = "";
        }
        else {
            el.setAttribute("open", "true");
            chevron.style.transform = "rotate(0deg)";
        }
    }

    arrayBufferToBase64(buffer) {
        const bytes = new Uint8Array(buffer);

        var binary = '';

        for (var i = 0; i < bytes.byteLength; i++) {
            binary += String.fromCharCode(bytes[i]);
        }

        return window.btoa(binary);
    }

    downloadFavicon(icon) {
        const base64 = fetch(icon)
            .then(async r => [await r.arrayBuffer(), r.headers.get("Content-Type")])
            .then(ab => `data:${ab[1]};base64,${this.arrayBufferToBase64(ab[0])}`)
            .catch(err => {
                console.error(err)
            })

        this.favicons.add(icon, base64);

        return base64;
    }

    checkURLSecurity(url) {
        var uri = Services.io.newURI(url);
        if (uri.schemeIs("javascript") || uri.schemeIs("data")) {
            const BRANDING_BUNDLE_URI = "chrome://branding/locale/brand.properties";
            var brandShortName = Services.strings
                .createBundle(BRANDING_BUNDLE_URI)
                .GetStringFromName("brandShortName");

            var errorStr = this.getString("load-js-data-url-error");
            Services.prompt.alert(windowRoot.ownerGlobal, brandShortName, errorStr);
            return false;
        }
        return true;
    }

    openLink(link, openInNew) {
        if (
            this.checkURLSecurity(link)
        ) {
            const isJavaScriptURL = link.startsWith("javascript:");
            windowRoot.ownerGlobal.openTrustedLinkIn(link, openInNew ? "tab" : "current", {
                allowPopups: isJavaScriptURL,
                allowInheritPrincipal: isJavaScriptURL,
            });
        }
    }
}

const bookmarks = new Bookmarks();