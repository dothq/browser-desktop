/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

class BrowserCustomizableOverflowableArea extends BrowserCustomizableArea {
	constructor() {
		super();
	}

	/**
	 * A map of all currently overflowing items and their widths
	 * @type {Map<Element, number>}
	 */
	overflowingItems = new Map();

	/**
	 * A unique set of nodes that were already hidden before overflowing started
	 * @type {Set<Element>}
	 */
	hiddenOverflowedItems = new Set();

	/**
	 * The overflow button that expands overflowed items
	 * @type {Element}
	 */
	#overflowButton = null;

	#checkOverflowHandle = null;

	/**
	 * Computes the overflow data for this overflowable area
	 */
	async #getOverflowData() {
		/**
		 * @param {Element} element
		 */
		function getInlineSize(element) {
			return element.getBoundingClientRect().width;
		}

		/**
		 * @param {Element | ShadowRoot} area
		 * @param {Element} [exceptChild]
		 */
		function sumChildrenInlineSize(area, exceptChild = null) {
			let sum = 0;

			for (const child of area.children) {
				const style = getComputedStyle(child);

				if (
					style.display == "none" ||
					XULPopupElement.isInstance(/** @type {any} */ (child)) ||
					(style.position != "static" && style.position != "relative")
				) {
					continue;
				}

				sum +=
					parseFloat(style.marginLeft) +
					parseFloat(style.marginRight);

				if (child != exceptChild) {
					sum += getInlineSize(child);
				}
			}

			return sum;
		}

		let totalAvailWidth = 0;
		let targetWidth = 0;
		let targetChildrenWidth = 0;

		await window.promiseDocumentFlushed(() => {
			const style = getComputedStyle(this);

			const toolbarChildrenWidth = sumChildrenInlineSize(
				this.shadowRoot,
				this.customizableContainer
			);

			totalAvailWidth =
				getInlineSize(this.customizableContainer) -
				parseFloat(style.paddingLeft) -
				parseFloat(style.paddingRight);

			targetWidth = getInlineSize(this.customizableContainer);
			targetChildrenWidth = sumChildrenInlineSize(
				this.customizableContainer
			);
		});

		const targetContentWidth = Math.max(targetWidth, targetChildrenWidth);
		const isOverflowing = Math.floor(targetContentWidth) > totalAvailWidth;

		return {
			isOverflowing,
			targetContentWidth,
			totalAvailWidth,
			targetChildrenWidth
		};
	}

	/**
	 * Ensures the overflow button is visible in the toolbar
	 */
	#ensureOverflowButton() {
		if (!this.#overflowButton) {
			this.#overflowButton = this.createCustomizableComponent("button", {
				command: "internal/customizableui/area-show-overflowing"
			});

			this.customizableContainer.insertAdjacentElement(
				"afterend",
				this.#overflowButton
			);
		}
	}

	/**
	 * Hides the overflow button if visible
	 */
	#hideOverflowButton() {
		if (this.#overflowButton) {
			this.#overflowButton.remove();
			this.#overflowButton = null;
		}
	}

	/**
	 * Determines whether the area should start overflowing or not
	 */
	async #maybeOverflow() {
		const { isOverflowing } = await this.#getOverflowData();

		let checkOverflowHandle = (this.#checkOverflowHandle = {});

		if (window.closed || this.#checkOverflowHandle != checkOverflowHandle) {
			return;
		}

		if (isOverflowing) {
			await this.#beginOverflowing();
			this.#ensureOverflowButton();
		} else {
			await this.#restoreOverflowed();
		}

		if (checkOverflowHandle == this.#checkOverflowHandle) {
			this.#checkOverflowHandle = null;
		}
	}

	/**
	 * Checks to see if any children can be hidden thanks to overflow
	 */
	async #beginOverflowing() {
		let checkOverflowHandle = this.#checkOverflowHandle;

		let { isOverflowing, targetContentWidth } =
			await this.#getOverflowData();

		let child = this.customizableContainer.lastElementChild;
		while (child && isOverflowing) {
			console.log(child, targetContentWidth, isOverflowing);
			const prevChild = child.previousElementSibling;

			if (child.getAttribute("overflows") != "false") {
				this.overflowingItems.set(child, targetContentWidth);

				let { width: childWidth } =
					window.windowUtils.getBoundsWithoutFlushing(child);

				if (!childWidth) {
					this.hiddenOverflowedItems.add(child);
				}

				child.toggleAttribute("overflowing", true);

				if (childWidth) {
					this.setAttribute("overflowing", "true");
				}
			}

			child = prevChild;
			({ isOverflowing, targetContentWidth } =
				await this.#getOverflowData());
		}
	}

	/**
	 * Restores any overflowed children to their original positions in the area
	 */
	async #restoreOverflowed() {
		const overflowingItems = Array.from(
			this.overflowingItems.entries()
		).reverse();

		for (const [child, width] of overflowingItems) {
			if (width) {
				const { totalAvailWidth } = await this.#getOverflowData();

				// Check whether we have enough available width to move
				// the element back into the toolbar
				if (totalAvailWidth <= width) {
					break;
				}

				this.overflowingItems.delete(child);
				child.toggleAttribute("overflowing", false);
			}
		}

		if (this.overflowingItems.size <= 0) {
			this.removeAttribute("overflowing");
			this.#hideOverflowButton();
		}
	}

	/**
	 * Fired when the window is resized
	 * @param {Event} event
	 */
	onWindowResize(event) {
		this.#maybeOverflow();
	}

	_handleOverflowableEvent(event) {
		switch (event.type) {
			case "resize":
				this.onWindowResize(event);
				break;
		}
	}

	/**
	 * @type {any}
	 * @param {BrowserDebugHologram} hologram
	 */
	renderDebugHologram = async (hologram) => {
		const {
			isOverflowing,
			targetContentWidth,
			totalAvailWidth,
			targetChildrenWidth
		} = await this.#getOverflowData();

		const el = super.renderDebugHologram(hologram);

		el.append(
			...[
				`Overflowing: ${isOverflowing ? "Yes" : "No"}`,
				`TargetContentWidth: ${targetContentWidth}`,
				`TargetChildrenWidth: ${targetChildrenWidth}`,
				`TotalAvailWidth: ${totalAvailWidth}`
			].map((t) => html("span", {}, t))
		);

		return el;
	};

	connectedCallback() {
		this.shadowRoot.appendChild(
			html("link", {
				rel: "stylesheet",
				href: "chrome://dot/content/widgets/browser-customizable-overflowable-area.css"
			})
		);

		this.toggleAttribute("overflowable");

		// window.addEventListener(
		// 	"resize",
		// 	this._handleOverflowableEvent.bind(this)
		// );

		this.customizableContainer.addEventListener("overflow", (e) => {
			this.customizableContainer.lastElementChild.toggleAttribute(
				"overflowing",
				true
			);
		});

		const re = (e) => {
			let child = this.customizableContainer.lastElementChild;
			while (child && child.hasAttribute("overflowing")) {
				child.removeAttribute("overflowing");
				child = child.previousElementSibling;
			}
		};

		this.customizableContainer.addEventListener("underflow", re);
		this.customizableContainer.addEventListener("resize", re);

		this.#maybeOverflow();
	}

	disconnectedCallback() {
		window.removeEventListener(
			"resize",
			this._handleOverflowableEvent.bind(this)
		);
	}
}

customElements.define(
	"browser-customizable-overflowable-area",
	BrowserCustomizableOverflowableArea
);
