/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { logger } from "./CustomizableUI";

export class CustomizableUIComponentBase<T = any> extends MozHTMLElement {
	/**
	 * Handle the Web Components connectedCallback
	 */
	public connectedCallback() {
		/* CustomizableUIComponentBase.render would need to exist in any child components that inherit this */
		if ((this as any).render) {
			const markup = (this as any).render();

			if (!markup) return;

			if (
				markup instanceof HTMLElement ||
				markup instanceof DocumentFragment ||
				markup instanceof XULElement
			) {
				if ((this as any).internalRender) {
					(this as any).internalRender(markup);
				} else {
					if (this.firstElementChild) {
						// If there is already something rendered to the
						// component, replace the node with the newly rendered node.
						this.replaceWith(markup);
					} else {
						// Otherwise, we just append the node as normal
						this.appendChild(markup);
					}
				}
			} else {
				throw new Error(
					`${this.constructor.name}#${this.id}.render() expected to return HTMLElement but got ${markup.constructor.name}.`
				);
			}
		} else {
			throw new Error(
				`${this.constructor.name}#${
					this.id
				}.render() is expected to be function but was ${typeof (this as any).render}.`
			);
		}
	}

	/**
	 * Handle the Web Components disconnectedCallback
	 */
	public disconnectedCallback() {
		/* Widget.deconstruct would need to exist in any child components that inherit this */
		if ((this as any).deconstruct) {
			(this as any).deconstruct();

			this.removeChild(this);
		} else {
			throw new Error(
				`${this.constructor.name}#${
					this.id
				}.deconstruct() is expected to be function but was ${typeof (this as any)
					.deconstruct}.`
			);
		}
	}

	/**
	 * Forces the component to be rerendered
	 */
	public rerender() {
		logger.debug(`Rerendering ${this.constructor.name}#${this.id}.`);

		this.connectedCallback();
	}

	/**
	 * This can just call connectedCallback again as we have a check
	 * to update the child rather than readding the child in the DOM.
	 */
	public attributeChangedCallback() {
		this.rerender();
	}

	/**
	 * Updates the props in the component from a partial object
	 * of components
	 */
	public recalculateProps(props: Partial<T>) {
		for (const kv of Object.entries(props)) {
			const key = kv[0] as keyof T;
			const value = kv[1] as any;

			logger.debug("recalculateProps", key, value);

			(this as any)[key] = value;
		}
	}

	/**
	 * Used internally in CustomizableUI to get back to parent
	 */
	public get _cui() {
		return window.DotCustomizableUI;
	}

	public constructor(props: Partial<T>) {
		super();

		logger.debug("Component props", props);

		this.recalculateProps(props);
	}
}

customElements.define("cui-component-base", CustomizableUIComponentBase);
