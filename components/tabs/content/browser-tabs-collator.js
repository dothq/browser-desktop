/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

class BrowserTabsCollator extends MozHTMLElement {
    EVENT_TAB_ADDED = "BrowserTabsCollator::TabAdded";
    EVENT_TAB_REMOVED = "BrowserTabsCollator::TabRemoved";
    EVENT_TAB_ATTRIBUTE_UPDATE = "BrowserTabsCollator::TabAttributeUpdate";

    constructor() {
        super();

        // We only want a single tabs collator in the DOM
        if (document.querySelector("browser-tabs-collator")) {
            throw new Error("Only a single browser-tabs-collator element can be instantiated!");
        }
    }

    /** @type {MutationObserver} */
    mutationObserver = null;

    /**
     * Fired when mutations occur on tab children
     * @type {MutationCallback}
     */
    _onMutate(mutations) {
        /** @param {Node} node */
        const isNodeTab = (node) => {
            return (
                node.nodeType == Node.ELEMENT_NODE &&
				/** @type {Element} */ (node).tagName == "tab" &&
                node.constructor.name == "BrowserTab"
            );
        };

        for (const mutation of mutations) {
            switch (mutation.type) {
                case "childList":
                    for (const removedNode of mutation.removedNodes) {
                        if (!isNodeTab(removedNode)) continue;

                        this._onTabRemoved(/** @type {BrowserTab} */(removedNode));
                    }

                    for (const addedNode of mutation.addedNodes) {
                        if (!isNodeTab(addedNode)) continue;

                        this._onTabAdded(/** @type {BrowserTab} */(addedNode));
                    }

                    break;
                case "attributes":
                    const target = mutation.target;
                    if (!isNodeTab(target)) continue;

                    this._onTabAttributeUpdate(
						/** @type {BrowserTab} */(target),
                        mutation.attributeName,
                        mutation.oldValue,
                    );
                    break;
            }
        }
    }

    /**
     * Dispatches an event to all tabs lists
     * @param {string} event
     * @param {any} data
     */
    _dispatchToTabsLists(event, data) {
        const evt = new CustomEvent(event, { detail: data });

        window.dispatchEvent(evt);
    }

    /**
     * Fired when a tab is added to the childList
     * @param {BrowserTab} tab
     */
    _onTabAdded(tab) {
        this._dispatchToTabsLists(this.EVENT_TAB_ADDED, { tab });
    }

    /**
     * Fired when a tab is removed from the childList
     * @param {BrowserTab} tab
     */
    _onTabRemoved(tab) {
        this._dispatchToTabsLists(this.EVENT_TAB_REMOVED, { tab });
    }

    /**
     * Fired when an attribute on a tab is updated
     * @param {BrowserTab} tab
     * @param {string} attributeName
     * @param {string} oldValue
     */
    _onTabAttributeUpdate(tab, attributeName, oldValue) {
        this._dispatchToTabsLists(this.EVENT_TAB_ATTRIBUTE_UPDATE, {
            tab,
            attributeName,
            oldValue,
            newValue: tab.getAttribute(attributeName)
        });
    }

    connectedCallback() {
        if (this.delayConnectedCallback()) return;

        this.mutationObserver = new MutationObserver(this._onMutate.bind(this));
        this.mutationObserver.observe(this, {
            childList: true,
            attributes: true,
            subtree: true
        });

        this._insertStylesheet();
    }

    _insertStylesheet() {
        const sheet = document.createElement("style");

        sheet.textContent = `browser-tabs-collator { display: none; }`;

        document.body.appendChild(sheet);
    }

    disconnectedCallback() {
        if (this.delayConnectedCallback()) return;
    }
}

customElements.define("browser-tabs-collator", BrowserTabsCollator);
