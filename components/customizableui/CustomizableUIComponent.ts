/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

export class CustomizableUIComponentBase<T = any> extends MozHTMLElement {
	/**
	 * Handle the Web Components connectedCallback
	 */
	public connectedCallback() {
		/* CustomizableUIComponentBase.render would need to exist in any child components that inherit this */
		if ((this as any).render) {
			const markup = (this as any).render();

			if (markup instanceof HTMLElement) {
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
			}
		} else {
			throw new Error(
				`${this.constructor.name}.render() is expected to be function but was ${typeof (
					this as any
				).render}.`
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
				`${
					this.constructor.name
				}.deconstruct() is expected to be function but was ${typeof (this as any)
					.deconstruct}.`
			);
		}
	}

	/**
	 * This can just call connectedCallback again as we have a check
	 * to update the child rather than readding the child in the DOM.
	 */
	public attributeChangedCallback() {
		console.debug(`Rerendering ${this.constructor.name}.`);

		this.connectedCallback();
	}

	public recalculateProps(props: Partial<T>) {
		for (const kv of Object.entries(props)) {
			const key = kv[0] as keyof T;
			const value = kv[1] as any;

			(this as any)[key] = value;
		}
	}

	public constructor(props: Partial<T>) {
		super();

		this.recalculateProps(props);
	}
}

customElements.define("cui-component-base", CustomizableUIComponentBase);
