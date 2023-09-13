/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

class BrowserRenderedTab extends BrowserCustomizableArea {
	constructor() {
		super();
	}

	get interactiveTags() {
		return ["button", "select", "input", "a"];
	}

	/**
	 * Checks whether an element is interactive/clickable
	 * @param {Element} el
	 */
	isInteractive(el) {
		return el.closest(this.interactiveTags.join(", "));
	}

	_linkedTab = null;

	/**
	 * The internal tab that this tab is linked to
	 * @type {BrowserTab}
	 */
	get linkedTab() {
		return this._linkedTab;
	}

	set linkedTab(tab) {
		if (this._linkedTab !== null) return;

		this._linkedTab = tab;
		this.setAttribute("tab", tab.id);
	}

	/**
	 * Determines whether the tab is able to be dragged by the mouse yet
	 */
	canDrag = false;

	_dragStarted = false;

	/**
	 * Determines if the tab has started dragging yet
	 */
	get dragStarted() {
		return this._dragStarted;
	}

	set dragStarted(val) {
		this._dragStarted = val;

		this.toggleAttribute("dragging", val);
	}

	/**
	 * Determines the X position of the tab when dragging
	 */
	get dragX() {
		return parseInt(this.style.getPropertyValue("--tab-drag-x"));
	}

	set dragX(x) {
		this.style.setProperty("--tab-drag-x", `${x}px`);
	}

	/**
	 * Determines the Y position of the tab when dragging
	 */
	get dragY() {
		return parseInt(this.style.getPropertyValue("--tab-drag-y"));
	}

	set dragY(y) {
		this.style.setProperty("--tab-drag-y", `${y}px`);
	}

	_initialMouseX = null;
	get initialMouseX() {
		return this._initialMouseX;
	}

	set initialMouseX(val) {
		this._initialMouseX = val;

		this._debugInitialMousePosition();
	}

	_initialMouseY = null;
	get initialMouseY() {
		return this._initialMouseY;
	}

	set initialMouseY(val) {
		this._initialMouseY = val;

		this._debugInitialMousePosition();
	}

	_debugInitialMousePosition() {
		let pointer = /** @type {HTMLDivElement} */ (
			document.querySelector("#tab-initial-mouse")
		);

		if (!pointer) {
			document.body.appendChild(
				(pointer = /** @type {HTMLDivElement} */ (
					html("div", { id: "tab-initial-mouse" })
				))
			);
		}

		console.log(this.initialMouseX, this.initialMouseY);

		Object.assign(pointer.style, {
			left: `${this.initialMouseX}px`,
			top: `${this.initialMouseY}px`,
			position: "absolute",
			width: "8px",
			height: "8px",
			background: "red",
			borderRadius: "8px",
			pointerEvents: "none",
			opacity: "0.5"
		});
	}

	/**
	 * The closest toolbar for this tab
	 * @returns {BrowserToolbar}
	 */
	get toolbar() {
		return this.closest("browser-toolbar");
	}

	/**
	 * Fired whenever the user clicks down onto the tab
	 */
	_onTabMouseDown(event) {
		// Ensure we eat up any mouse down events to interactive elements
		// We don't want the tab to be selected if clicking down on a button for example
		if (this.isInteractive(event.target)) {
			return;
		}

		this.linkedTab.select();
		this.canDrag = true;

		window.addEventListener("mousemove", this);
	}

	_onTabMouseUp() {
		if (this.canDrag) {
			this.canDrag = false;
			this.dragStarted = false;

			this.initialMouseX = null;
			this.initialElementX = null;

			this.initialMouseY = null;
			this.initialElementY = null;

			this.dragX = 0;
			this.dragY = 0;
		}

		window.removeEventListener("mousemove", this);
	}

	_onTabMouseOver() {
		if (this.previousElementSibling) {
			this.previousElementSibling.toggleAttribute("precedes-hover", true);
		}
	}

	_onTabMouseOut() {
		if (this.previousElementSibling) {
			this.previousElementSibling.removeAttribute("precedes-hover");
		}
	}

	/**
	 * Fired when the tab is in "drag" mode and the mouse is moving
	 * @param {MouseEvent} event
	 */
	_onMouseMove(event) {
		if (!this.dragStarted) {
			this.dragStarted = true;

			this.shiftX = event.screenX - this.getBoundingClientRect().x;
		}

		if (this.toolbar.isHorizontal) {
			let x =
				event.screenX -
				this.shiftX -
				this.parentElement.getBoundingClientRect().x;

			console.log(x);

			if (x < 0) {
				x = 0;
				return;
			}
			let rightEdge = this.parentElement.offsetWidth - this.offsetWidth;
			console.log(
				"rightEdge",
				rightEdge,
				this.parentElement.offsetWidth,
				this.offsetWidth
			);
			if (x > rightEdge) {
				x = rightEdge;
			}

			console.log(x);

			this.toggleAttribute("dragging-shadow", x > 0);
			this.dragX = x;
		} else {
			this.dragY += event.screenY - this.lastMouseY;
		}

		this.lastMouseX = event.screenX;
		this.lastMouseY = event.screenY;
	}

	connectedCallback() {
		super.connect({
			name: "tab",

			layout: "tab",

			showKeybindings: false
		});

		this.appendChild(html("div", { class: "browser-tab-background" }));

		this.style.width = "var(--tab-max-width)";

		this.shadowRoot.addEventListener("mousedown", this);
		this.addEventListener("mouseover", this);
		this.addEventListener("mouseout", this);

		window.addEventListener("mouseup", this);
	}

	disconnectedCallback() {
		if (this.delayConnectedCallback()) return;

		this.shadowRoot.removeEventListener("mousedown", this);
		this.removeEventListener("mouseover", this);
		this.removeEventListener("mouseout", this);

		window.removeEventListener("mouseup", this);
	}

	/**
	 * Handles incoming tab events
	 * @param {Event} event
	 */
	handleEvent(event) {
		switch (event.type) {
			case "mousedown":
				this._onTabMouseDown(event);
				break;
			case "mouseover":
				this._onTabMouseOver();
				break;
			case "mouseout":
				this._onTabMouseOut();
				break;
			case "mouseup": {
				this._onTabMouseUp();
				break;
			}
			case "mousemove": {
				if (this.canDrag) {
					this._onMouseMove(/** @type {MouseEvent} */ (event));
				}
				break;
			}
		}
	}

	/**
	 * Fired whenever an attribute is updated on an internal tab
	 * @param {string} name
	 * @param {string} oldValue
	 * @param {string} newValue
	 */
	internalTabAttributeChangedCallback(name, oldValue, newValue) {
		if (!this.isConnectedAndReady) return;

		const showAttribute = newValue !== null;

		if (showAttribute) {
			this.setAttribute(name, newValue);
		} else {
			this.removeAttribute(name);
		}

		switch (name) {
			case "progresspercent":
				this.style.setProperty("--tab-load-percent", newValue);
				break;
		}
	}
}

customElements.define("browser-tab", BrowserRenderedTab);
