/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

export class BrowserCustomizableComponent {
	static TYPE_WIDGET = 0;
	static TYPE_AREA = 1;

	/**
	 * The ID or type of this customizable component
	 *
	 * @type {string}
	 */
	id = null;

	/**
	 * The type of this component
	 * @type {number}
	 */
	type = null;

	/** @type {(ctx: any) => Element | HTMLElement | DocumentFragment} */
	#internalRender = null;

	/**
	 * Renders the widget with optional attributes
	 *
	 * @param {Document} doc
	 * @param {Record<string, any>} attributes
	 */
	render(doc, attributes) {
		const { html } = doc.ownerGlobal;

		return this.#internalRender.call(this, {
			doc,
			attributes,
			html
		});
	}

	/**
	 * @param {number} type
	 * @param {string} id
	 * @param {({
	 *      doc,
	 *      attributes,
	 *      html
	 * }: {
	 *      doc: Document,
	 *      attributes?: Record<string, any>,
	 *      html: typeof globalThis["html"]
	 * }) => Element | HTMLElement | DocumentFragment} render
	 */
	constructor(type, id, render) {
		this.type = type;
		this.id = id;

		this.#internalRender = render;
	}
}
