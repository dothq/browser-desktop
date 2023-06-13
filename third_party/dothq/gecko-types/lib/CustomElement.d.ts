/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

export interface CustomElement {
	/**
	 * Invoked each time the custom element is appended into a document-connected element.
	 * This will happen each time the node is moved, and may happen before the element's contents have been fully parsed.
	 *
	 * **Note:** `connectedCallback` may be called once your element is no longer connected, use `Node.isConnected` to make sure.
	 */
	connectedCallback(): void;

	/**
	 * Invoked each time the custom element is disconnected from the document's DOM.
	 */
	disconnectedCallback(): void;

    /**
     * Invoked each time the custom element is moved to a new document.
     */
    adoptedCallback(): void;

    /**
     * Invoked each time one of the custom element's attributes is added, removed, or changed. 
     * Which attributes to notice change for is specified in a `static get observedAttributes` method
     * 
     * @param {string} name
     * @param {any} oldValue
     * @param {any} newValue
     */
    attributeChangedCallback(name: string, oldValue: any, newValue: any): void;
}
