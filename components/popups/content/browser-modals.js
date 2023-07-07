/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

class BrowserModals extends MozHTMLElement {
    constructor() {
        super();

        this.mutationObserver = new MutationObserver(this.observeMutations.bind(this));
        this.resizeObserver = new ResizeObserver(this.onBoxResize.bind(this));
    }

    get observedAttributes() {
        return [
            "hidden"
        ]
    }

    /**
     * All open modals for this browser
     * @type {BrowserContentPopup[]}
     */
    get modals() {
        return Array.from(/** @type {any} */(this.children));
    }

    /**
     * Add a new modal to the modal box
     * @param {Element} element 
     */
    insertModal(element) {
        this.appendChild(element);
        this.recalculateVisibility();
    }

    /**
     * Observes changes to children in the modal box
     * @type {MutationCallback}
     */
    observeMutations(mutations) {
        for (const mut of mutations) {
            switch (mut.type) {
                case "childList":
                    for (const node of mut.addedNodes) {
                        if (node.nodeType == Node.ELEMENT_NODE) {
                            /** @type {HTMLElement} */ (node).hidden = true;
                        }
                    }

                    if (mut.removedNodes.length) {
                        // Recheck whether we can keep the modal box open
                        this.recalculateVisibility();
                    }

                    break;
            }
        }
    }

    onBoxResize() {
        const bounds = this.getBoundingClientRect();

        this.style.setProperty("--modal-box-width", `${bounds.width}px`);
        this.style.setProperty("--modal-box-height", `${bounds.height}px`);
    }

    recalculateVisibility() {
        this.hidden = !this.modals.filter(m => !m.hidden).length;
    }

    connectedCallback() {
        if (this.delayConnectedCallback()) return;

        this.hidden = true;

        this.mutationObserver.observe(this, {
            childList: true,
            attributeFilter: ["hidden"]
        });

        this.resizeObserver.observe(this);

        this.onBoxResize();
    }

    disconnectedCallback() {
        if (this.delayConnectedCallback()) return;
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (!this.isConnectedAndReady) return;

        switch (name) {
            case "hidden":
                if (newValue == false) {
                    this.onBoxResize();
                }
        }
    }
}

customElements.define("browser-modals", BrowserModals);