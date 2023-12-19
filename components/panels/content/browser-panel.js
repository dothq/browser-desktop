/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

var MozPopupElement = MozElements.MozElementMixin(XULPopupElement);

class BrowserPanel extends MozPopupElement {
	#debugVisiblePref = "dot.panels.debug_information.visible";

	constructor() {
		super();

		this.classList.add("browser-panel");

		this.setAttribute(
			"is",
			customElements.getName(
				/** @type {CustomElementConstructor} */ (this.constructor)
			)
		);
		this.setAttribute("animate", "false");
		this.setAttribute("consumeoutsideclicks", "true");
		this.setAttribute("incontentshell", "false");
		this.setAttribute("ignorekeys", "true");
		this.setAttribute("tooltip", "aHTMLTooltip");
	}

	/**
	 * Arguments supplied to the panel when it opens
	 */
	openArgs = {};

	/**
	 * The container element that holds the panel's contents
	 */
	get container() {
		return /** @type {BrowserPanelArea} */ (
			this.querySelector(".browser-panel-container")
		);
	}

	/**
	 * Fires when the popup starts showing on-screen
	 */
	onPopupShowing() {
		Services.els.addSystemEventListener(window, "mousemove", this, true);

		if (this.getAttribute("animate") == "true") {
			this.toggleAttribute("open", true);
		}
	}

	/**
	 * Fires when the popup is shown on-screen
	 */
	onPopupShown() {
		const alertEvt = document.createEvent("Events");
		alertEvt.initEvent("AlertActive", true, true);

		this.dispatchEvent(alertEvt);
	}

	/**
	 * Fires when the popup starts being hidden
	 */
	onPopupHiding() {
		Services.els.removeSystemEventListener(window, "mousemove", this, true);
		Services.els.removeSystemEventListener(window, "click", this, true);

		// Remove the panel once all transitions have completed
		if (this.getAttribute("animate") == "true") {
			window.addEventListener(
				"transitionend",
				() => {
					this.remove();
				},
				{
					once: true
				}
			);

			this.removeAttribute("open");
		} else {
			this.remove();
		}
	}

	/**
	 * Fired when the mouse moves across browser windows
	 * @param {MouseEvent} event
	 */
	onSystemMouseMove(event) {
		const panelBounds = this.getOuterScreenRect();

		const containerBounds = this.container.getBoundingClientRect();
		const outerContainerBounds = window.windowUtils.toScreenRect(
			containerBounds.x,
			containerBounds.y,
			containerBounds.width,
			containerBounds.height
		);

		const mouseBounds = window.windowUtils.toScreenRect(
			/** @type {MouseEvent} */ (event).clientX,
			/** @type {MouseEvent} */ (event).clientY,
			0,
			0
		);

		const lowerX = outerContainerBounds.x;
		const lowerY = outerContainerBounds.y;
		const upperX = lowerX + outerContainerBounds.width;
		const upperY = lowerY + outerContainerBounds.height;

		const lowerPanelX = panelBounds.x;
		const lowerPanelY = panelBounds.y;
		const upperPanelX = lowerPanelX + panelBounds.width;
		const upperPanelY = lowerPanelY + panelBounds.height;

		const insideContainer =
			mouseBounds.x >= lowerX &&
			mouseBounds.x <= upperX &&
			mouseBounds.y >= lowerY &&
			mouseBounds.y <= upperY;

		const insidePanel =
			mouseBounds.x >= lowerPanelX &&
			mouseBounds.x <= upperPanelX &&
			mouseBounds.y >= lowerPanelY &&
			mouseBounds.y <= upperPanelY;

		this.insideMargins = insidePanel && !insideContainer;

		this.style.pointerEvents = this.insideMargins ? "none" : "";
	}

	/**
	 * Dispatches a panels event to an element
	 * @param {Element} element
	 * @param {string} name
	 * @param {Record<string, any>} data
	 */
	_dispatchEvent(element, name, data) {
		const evt = new CustomEvent(`BrowserPanels::${name}`, {
			detail: data
		});

		element.dispatchEvent(evt);
	}

	/**
	 *
	 * @param {any[]} args
	 * @returns {any}
	 * @deprecated
	 */
	openPopup(...args) {
		console.log("open pop");
		super.openPopup(...args);
	}

	/**
	 *
	 * @param {any[]} args
	 * @returns {any}
	 * @deprecated
	 */
	openPopupAtScreen(...args) {
		super.openPopupAtScreen(...args);
	}

	/**
	 *
	 * @param {any[]} args
	 * @returns {any}
	 * @deprecated
	 */
	openPopupAtScreenRect(...args) {
		super.openPopupAtScreenRect(...args);
	}

	/**
	 * Opens the panel
	 * @param {import("../BrowserPanels.sys.mjs").PanelOpenOptions} openOptions
	 */
	openPanel(openOptions) {
		const noCoords =
			!("x" in openOptions) ||
			!("y" in openOptions) ||
			typeof openOptions.x == "undefined" ||
			typeof openOptions.y == "undefined";

		if (noCoords && !openOptions.element) {
			throw new Error(
				"Properties 'x' and 'y' or 'element' are required."
			);
		}

		if (openOptions.element && !openOptions.anchor) {
			openOptions.anchor = "before before";
		}

		if (openOptions.element && noCoords) {
			const [anchorX, anchorY] = openOptions.anchor.split(" ");

			const bounds = openOptions.element.getBoundingClientRect();

			const width = anchorX == "before" ? 0 : bounds.width;
			const height = anchorY == "before" ? 0 : bounds.height;

			openOptions.x = bounds.x + width;
			openOptions.y = bounds.y + height;
		}

		this.openArgs = openOptions?.args || {};

		this.addEventListener(
			"popupshowing",
			() => {
				this._dispatchEvent(
					openOptions.element || this.ownerDocument.documentElement,
					"PanelOpen",
					{
						id: this.id
					}
				);
			},
			{ once: true }
		);

		this.addEventListener(
			"popuphiding",
			() => {
				this._dispatchEvent(
					openOptions.element || this.ownerDocument.documentElement,
					"PanelClose",
					{
						id: this.id
					}
				);
			},
			{ once: true }
		);

		console.log("Opening", this, "at", openOptions);

		this.ownerDocument.documentElement.appendChild(this);

		switch (openOptions.coordMode) {
			case "screen":
				super.openPopupAtScreen(openOptions.x, openOptions.y);

				break;
			default:
				super.openPopup(null, "", openOptions.x, openOptions.y);

				break;
		}
	}

	/**
	 * Hide the popup if it is open. The cancel argument is used as a hint that
	 * the popup is being closed because it has been cancelled, rather than
	 * something being selected within the panel.
	 *
	 * @param {boolean} [cancel] if true, then the popup is being cancelled.
	 * @param {boolean} [force]
	 * @returns {any}
	 */
	hidePopup(cancel, force) {
		// If we explicitly disallow autohiding popups, avoid
		// calling the hidePopup method on XULPopupElement
		if (
			Services.prefs.getBoolPref("ui.popup.disable_autohide", false) &&
			!force
		) {
			return;
		}

		super.hidePopup(cancel);
	}

	_maybeRenderDebug() {
		const isVisible = Services.prefs.getBoolPref(
			this.#debugVisiblePref,
			false
		);

		clearInterval(this.debugUpdateInt);
		this.debugUpdateInt = null;

		if (isVisible) {
			if (!this.querySelector("#panel-debug")) {
				this.prepend(
					html(
						"div",
						{
							id: "panel-debug",
							style: {
								display: "flex",
								flexDirection: "row",
								backgroundColor: "black",
								color: "white",
								fontWeight: 600,
								fontSize: "10px",
								fontFamily: "monospace",
								whiteSpace: "nowrap",
								gap: "4px"
							}
						},
						""
					)
				);
			}

			this.debugUpdateInt = setInterval(() => {
				const bounds = this.getBoundingClientRect();

				this.querySelector("#panel-debug").replaceChildren(
					...[
						`W: ${Math.round(bounds.width)}`,
						`H: ${Math.round(bounds.height)}`,
						`O: ${
							parseFloat(getComputedStyle(this).opacity).toFixed(
								2
							) || 0
						}`,
						`Sl: ${Math.round(this.scrollLeft)}px`,
						`SlMax: ${Math.round(
							/** @type {any} */ (this).scrollLeftMax
						)}px`
					].map((c) => html("span", {}, c))
				);
			}, 1);
		} else {
			if (this.querySelector("#panel-debug")) {
				this.querySelector("#panel-debug").remove();
			}
		}
	}

	/**
	 * Handles incoming events to the popup
	 * @param {Event} event
	 */
	handleEvent(event) {
		switch (event.type) {
			case "popupshowing":
				this.onPopupShowing();
				break;
			case "popupshown":
				this.onPopupShown();
				break;
			case "popuphiding":
				this.onPopupHiding();
				break;
			case "click":
				event.preventDefault();
				event.stopPropagation();

				if (this.insideMargins) {
					this.hidePopup(true);
				}

				break;
			case "mousemove":
				this.onSystemMouseMove(/** @type {MouseEvent} */ (event));
				break;
		}
	}

	connectedCallback() {
		if (this.delayConnectedCallback()) return;

		Services.prefs.addObserver(
			this.#debugVisiblePref,
			this._maybeRenderDebug.bind(this)
		);
		this._maybeRenderDebug();

		this.addEventListener("popupshowing", this);
		this.addEventListener("popupshown", this);
		this.addEventListener("popuphiding", this);
	}

	disconnectedCallback() {
		if (this.delayConnectedCallback()) return;

		this.removeEventListener("popupshowing", this);
		this.removeEventListener("popupshown", this);
		this.removeEventListener("popuphiding", this);
	}
}

customElements.define("browser-panel", BrowserPanel, { extends: "panel" });
