/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

var { CommandAudiences } = ChromeUtils.importESModule(
	"resource://gre/modules/CommandAudiences.sys.mjs"
);

var { ConsoleAPI } = ChromeUtils.importESModule(
	"resource://gre/modules/Console.sys.mjs"
);

class BrowserRenderedTab extends BrowserCustomizableArea {
	/**
	 * The minimum width of a tab allowed
	 * before we need to hide actions
	 */
	TAB_MIN_WIDTH_ACTIONS = 90;

	constructor() {
		super();

		this.resizeObserver = new ResizeObserver(this._onTabResize.bind(this));
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
	}

	_initialMouseY = null;
	get initialMouseY() {
		return this._initialMouseY;
	}

	set initialMouseY(val) {
		this._initialMouseY = val;
	}

	/**
	 * The closest tabbox for this tab
	 * @returns {BrowserTabsElement}
	 */
	get tabbox() {
		return /** @type {BrowserTabsElement} */ (
			/** @type {ShadowRoot} */ (this.getRootNode()).host
		);
	}

	/**
	 * The tab's specified width
	 */
	get width() {
		return parseInt(this.style.getPropertyValue("--tab-width"));
	}

	/**
	 * Updates the tab's width
	 * @param {any} newWidth
	 */
	set width(newWidth) {
		this.style.setProperty(
			"width",
			typeof newWidth == "number" ? newWidth + "px" : newWidth,
			"important"
		);
	}

	/**
	 * The logger singleton for the tab
	 * @type {Console & { maxLogLevel: string, shouldLog: ((logLevel) => boolean); }}
	 */
	get logger() {
		if (this._logger) return this._logger;

		return (this._logger = new ConsoleAPI({
			maxLogLevel: "warn",
			maxLogLevelPref: "dot.tabs.loglevel",
			prefix: `BrowserTab (${this.linkedTab?.id || this.id})`
		}));
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

		// if (this.toolbar.isHorizontal) {
		// 	let x =
		// 		event.screenX -
		// 		this.shiftX -
		// 		this.parentElement.getBoundingClientRect().x;

		// 	console.log(x);

		// 	if (x < 0) {
		// 		x = 0;
		// 		return;
		// 	}
		// 	let rightEdge = this.parentElement.offsetWidth - this.offsetWidth;
		// 	console.log(
		// 		"rightEdge",
		// 		rightEdge,
		// 		this.parentElement.offsetWidth,
		// 		this.offsetWidth
		// 	);
		// 	if (x > rightEdge) {
		// 		x = rightEdge;
		// 	}

		// 	console.log(x);

		// 	this.toggleAttribute("dragging-shadow", x > 0);
		// 	this.dragX = x;
		// } else {
		// 	this.dragY += event.screenY - this.lastMouseY;
		// }

		this.lastMouseX = event.screenX;
		this.lastMouseY = event.screenY;
	}

	/**
	 * Handles the tab's transition events
	 * @param {TransitionEvent} event
	 */
	_onTabTransition(event) {
		const started = event.type == "transitionstart";

		this.toggleAttribute("animating", started);

		const evt = new CustomEvent(
			`BrowserTabs::${
				started ? "TabAnimationStarted" : "TabAnimationEnded"
			}`,
			{
				detail: { tab: this }
			}
		);

		window.dispatchEvent(evt);
	}

	/**
	 * Updates the tab's width for a certain state
	 * @param {string} state
	 */
	_setTabWidth(state) {
		if (state == "open") {
			this.width = 240;
		} else {
			this.width = 0;
		}
	}

	/**
	 * Determines how long to animate the tab for on open
	 */
	get _tabInAnimateDuration() {
		return gDot.prefersReducedMotion
			? 0
			: Services.prefs.getIntPref(
					"dot.tabs.in_animation_duration_ms",
					50
			  );
	}

	/**
	 * Determines how long to animate the tab for on close
	 */
	get _tabOutAnimateDuration() {
		return gDot.prefersReducedMotion
			? 0
			: Services.prefs.getIntPref(
					"dot.tabs.out_animation_duration_ms",
					30
			  );
	}

	get animationProps() {
		const updateCallback = () => {
			if (this.logger.shouldLog("debug")) {
				const style = getComputedStyle(this);
				const containerStyle = getComputedStyle(
					this.customizableContainer
				);

				const width = this.getBoundingClientRect().width;
				const maxWidth = parseInt(style.maxWidth) || width;
				const minWidth = parseInt(style.minWidth) || width;
				const opacity = parseFloat(containerStyle.opacity);

				this.logger.debug(
					`    W = ${width
						.toFixed(0)
						.padStart(3, "0")}, MaxW = ${maxWidth
						.toFixed(0)
						.padStart(3, "0")}, MinW = ${minWidth
						.toFixed(0)
						.padStart(3, "0")}, O = ${opacity.toFixed(1)}`
				);
			}
		};

		return {
			easing: "cubicBezier(0.2, 1.0, 0.2, 1.0)",
			start: updateCallback,
			update: updateCallback,
			complete: updateCallback
		};
	}

	/**
	 * Starts the in animation for the tab
	 */
	animateIn(duration = this._tabInAnimateDuration) {
		this.setAttribute("anime-animating", "opening");

		this.width = 0;

		this.logger.debug(`Animating in for ${duration}ms`);

		const inAnimation = {
			...this.animationProps,
			duration,
			endDelay: duration
		};

		const widthAnimation = window.timeline(inAnimation).add({
			targets: this,
			width: [
				0,
				Math.max(this.tabbox.tabMinWidth, this.tabbox.tabMaxWidth)
			]
		});

		const opacityAnimation = window.timeline(inAnimation).add({
			targets: this.customizableContainer,
			duration: inAnimation.duration / 2,
			delay: inAnimation.duration * 0.05,
			opacity: [0, 1]
		});

		return new Promise((r) => {
			Promise.allSettled([
				widthAnimation.finished,
				opacityAnimation.finished
			]).then(() => {
				this.removeAttribute("anime-animating");

				r();
			});
		});
	}

	/**
	 * Starts the out animation for the tab
	 */
	animateOut(duration = this._tabOutAnimateDuration) {
		const tabWidth = this.getBoundingClientRect().width;

		this.setAttribute("anime-animating", "closing");

		// Freeze the last tab width as the max width
		// to avoid flickering when the tab collapses
		this.style.setProperty("max-width", `${tabWidth}px`, "important");

		// This formula exponentially increases the time to close a tab
		// For instance:
		//     If tabWidth is 240 (or whatever tabMaxWidth is), the multiplier is 1
		//     If tabWidth is 120, the multiplier is 1.5
		//     If tabWidth is 60, the multiplier is 1.75
		duration *= 1 + (1 - (1 * tabWidth) / this.tabbox.tabMaxWidth);

		this.logger.debug(`Animating out for ${duration}ms`);

		const outAnimation = {
			...this.animationProps,
			duration,
			endDelay: 300
		};

		const widthAnimation = window.timeline(outAnimation).add({
			targets: this,
			width: [tabWidth, 0]
		});

		const opacityAnimation = window.timeline(outAnimation).add({
			targets: this.customizableContainer,
			duration: outAnimation.duration / 2,
			opacity: 0
		});

		return new Promise((r) => {
			Promise.allSettled([
				widthAnimation.finished,
				opacityAnimation.finished
			]).then(() => {
				r();
			});
		});
	}

	/**
	 * The context for this tab
	 */
	get context() {
		const self = this;

		return {
			self,
			audience: CommandAudiences.TAB,

			get window() {
				return self.ownerGlobal;
			},

			get tab() {
				return self.linkedTab;
			},

			get browser() {
				return this.tab.linkedBrowser;
			}
		};
	}

	_onTabResize() {
		const { width, height } = this.getBoundingClientRect();

		this.style.setProperty("--tab-true-width", width + "px");
		this.style.setProperty("--tab-true-height", height + "px");

		this.toggleAttribute(
			"hidetabactions",
			width <= this.TAB_MIN_WIDTH_ACTIONS
		);
	}

	/**
	 * @param {BrowserDebugHologram} hologram
	 */
	renderTabDebugHologram(hologram) {
		const width = this.getBoundingClientRect().width;

		return html(
			"div",
			{},
			...[
				`ID: ${this.id.split("tab-")[1]}`,
				`W: ${width.toFixed(0)}`,
				`MaxW: ${(
					parseInt(getComputedStyle(this).maxWidth) || width
				).toFixed(0)}`,
				`MinW: ${(
					parseInt(getComputedStyle(this).minWidth) || width
				).toFixed(0)}`
			].map((t) => html("span", {}, t))
		);
	}

	connectedCallback() {
		super.connect("tab", {
			mode: "icons",
			showKeybindings: false
		});

		this.hidden = true;
		this.setAttribute("tooltip", "browser-tabs-tooltip");
		this.setAttribute("tooltipanchor", "overlap");

		this.shadowRoot.appendChild(html("slot", { name: "tab-internal" }));
		this.appendChild(
			html(
				"div",
				{
					class: "browser-tab-background",
					slot: "tab-internal"
				},
				html("div", { class: "browser-tab-burst" })
			)
		);

		const debugHologram = BrowserDebugHologram.create(
			{
				id: "tab",
				prefId: "dot.tabs.debug_information.visible"
			},
			this.renderTabDebugHologram.bind(this)
		);

		this.shadowRoot.appendChild(debugHologram);

		this.shadowRoot.addEventListener("mousedown", this);
		this.addEventListener("mouseover", this);
		this.addEventListener("mouseout", this);
		this.addEventListener("transitionstart", this);
		this.addEventListener("transitionend", this);

		window.addEventListener("mouseup", this);

		this.resizeObserver.observe(this);
	}

	disconnectedCallback() {
		if (this.delayConnectedCallback()) return;

		this.shadowRoot.removeEventListener("mousedown", this);
		this.removeEventListener("mouseover", this);
		this.removeEventListener("mouseout", this);
		this.removeEventListener("transitionstart", this);
		this.removeEventListener("transitionend", this);

		window.removeEventListener("mouseup", this);

		this.resizeObserver.disconnect();
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
			case "transitionstart":
			case "transitionend": {
				this._onTabTransition(/** @type {TransitionEvent} */ (event));
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

		switch (name) {
			case "title":
				break;
			case "progresspercent":
				this.style.setProperty("--tab-load-percent", newValue);
				break;
			default:
				const showAttribute = newValue !== null;

				if (showAttribute) {
					this.setAttribute(name, newValue);
				} else {
					this.removeAttribute(name);
				}
		}
	}
}

customElements.define("browser-tab", BrowserRenderedTab);
