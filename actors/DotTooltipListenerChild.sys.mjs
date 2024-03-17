/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const { setTimeout, clearTimeout } = ChromeUtils.importESModule(
	"resource://gre/modules/Timer.sys.mjs"
);

const { AppConstants } = ChromeUtils.importESModule(
	"resource://gre/modules/AppConstants.sys.mjs"
);

const { DOMUtils } = ChromeUtils.importESModule(
	"resource://gre/modules/DOMUtils.sys.mjs"
);

/**
 * The amount of mouse movement pixels we can tolerate
 * before we automatically hide the tooltip.
 *
 * This is important: especially with mice that have
 * cursor jiggle, we need to ensure those users aren't
 * losing the tooltip randomly.
 */
const kTooltipMouseMoveTolerance = 7;

/**
 * The amount to offset the Y position of the tooltip
 * to account for the cursor position.
 */
const kTooltipMouseTopMargin = 21;

/**
 * A partial implementation of nsXULTooltipListener
 */
export class DotTooltipListenerChild extends JSWindowActorChild {
	TOOLTIP_LOCATION_FLOATING = 0;
	TOOLTIP_LOCATION_STATUS = 1;

	TOOLTIP_LOCATION_NAMES = {
		floating: this.TOOLTIP_LOCATION_FLOATING,
		status: this.TOOLTIP_LOCATION_STATUS
	};

	/**
	 * Determines whether can show tooltips in browser chrome
	 */
	get showTooltips() {
		return Services.prefs.getBoolPref("browser.chrome.toolbar_tips", true);
	}

	/**
	 * Determines whether tooltips will hide on a keydown event
	 * States:
	 *   0: Don't hide
	 *   1: Always hide
	 *   2: Only hide if we aren't pressing a modifier
	 */
	get hideTooltipsOnKeyDown() {
		return Services.prefs.getIntPref(
			"browser.chrome.toolbar_tips.hide_on_keydown",
			2
		);
	}

	/**
	 * Determines where the tooltip should be displayed
	 * States:
	 *   0: Show as a floating tip
	 *   1: Show in the statusbar (if available)
	 */
	get tooltipDisplayLocation() {
		switch (
			Services.prefs.getIntPref("browser.chrome.toolbar_tips.location", 0)
		) {
			case 1:
				return this.TOOLTIP_LOCATION_STATUS;
			default:
				return this.TOOLTIP_LOCATION_FLOATING;
		}
	}

	/**
	 * The delay before the floating tooltip is shown in ms
	 */
	get tooltipFloatingShowDelayMs() {
		return Services.prefs.getIntPref(
			"browser.chrome.toolbar_tips.floating.show_delay_ms",
			500
		);
	}

	/**
	 * The delay before the status tooltip is shown in ms
	 */
	get tooltipStatusShowDelayMs() {
		return Services.prefs.getIntPref(
			"browser.chrome.toolbar_tips.status.show_delay_ms",
			100
		);
	}

	/**
	 * Determines whether a key event can hide the tooltip or not
	 * @param {KeyboardEvent} event
	 * @returns
	 */
	keyEventHidesTooltip(event) {
		switch (this.hideTooltipsOnKeyDown) {
			// Don't hide
			case 0:
				return false;
			// Always hide
			case 1:
				return true;
			// Only hide if we aren't pressing a modifier
			default:
				const { DOM_KEY_LOCATION_LEFT, DOM_KEY_LOCATION_RIGHT } =
					KeyboardEvent;
				return (
					event.location !== DOM_KEY_LOCATION_LEFT &&
					event.location !== DOM_KEY_LOCATION_RIGHT
				);
		}
	}

	/**
	 * Hides the tooltip, if visible
	 */
	hideTooltip() {
		if (this._currentTooltip) {
			this._currentTooltip.hidePopup();
		}

		this.destroyTooltip();
	}

	/**
	 * Destroys the tooltip
	 */
	destroyTooltip() {
		if (this._currentTooltip) {
			const doc = this._currentTooltip.ownerDocument;

			Services.els.removeSystemEventListener(doc, "wheel", this, true);
			Services.els.removeSystemEventListener(
				doc,
				"mousedown",
				this,
				true
			);
			Services.els.removeSystemEventListener(doc, "mouseup", this, true);
			Services.els.removeSystemEventListener(doc, "keydown", this, true);

			Services.els.removeSystemEventListener(
				this._currentTooltip,
				"popupshowing",
				this,
				false
			);

			Services.els.removeSystemEventListener(
				this._currentTooltip,
				"popuphiding",
				this,
				false
			);

			this._currentTriggerNode.removeAttribute("tooltipopen");

			this.killTooltipTimer();

			this._currentTooltip = null;
			this._currentTriggerNode = null;
		}
	}

	/**
	 * Kills the ongoing tooltip show timer
	 */
	killTooltipTimer() {
		if (this._tooltipTimer) {
			clearTimeout(this._tooltipTimer);
			this._tooltipTimer = null;
		}
	}

	/**
	 * Obtains the tooltip node for a given target node
	 * @param {Element} node
	 */
	getTooltipFor(node) {
		const doc = node.ownerDocument;
		const win = doc.ownerGlobal;

		if (!doc || !win || (win && win.closed)) {
			return;
		}

		// On Windows, the OS shows the tooltip, so we don't want Gecko to do it
		if (AppConstants.platform == "win") {
			return;
		}

		/** @type {import("third_party/dothq/gecko-types/lib").XULPopupElement} */
		let tooltip = null;

		const tooltipId = node.getAttribute("tooltip");

		if (tooltipId && tooltipId.length) {
			// if tooltip == _child, look for first <tooltip> child
			if (tooltipId == "_child") {
				tooltip = node.querySelector("tooltip");
			} else {
				const tooltipEl = doc.getElementById(tooltipId);

				if (tooltipEl) {
					if (tooltipEl.tagName == "tooltip") {
						tooltip =
							/** @type {import("third_party/dothq/gecko-types/lib").XULPopupElement} */ (
								tooltipEl
							);
					}
				}
			}
		}

		if (tooltip) {
			const tooltipText = node.getAttribute("tooltiptext");

			if (tooltipText && tooltipText.length) {
				tooltip.setAttribute("label", tooltipText);
			}
		}

		return tooltip;
	}

	/**
	 * Obtains the event target, ignoring shadow roots
	 * @param {Event} event
	 */
	getEventTarget(event) {
		if (!event) return;

		const { target } = event;

		const composedTarget = /** @type {any} */ (event).composedTarget;

		// If the composed target differs to the real target, use that instead
		if (target && target !== composedTarget) {
			return composedTarget;
		}

		return target;
	}

	/**
	 * Obtains the tooltip nodes
	 * @param {Event} event
	 * @returns
	 */
	getTooltipNodes(event) {
		// Check if event is still accessible, the node
		// holding the tooltip may have been purged from
		// the DOM, resulting in a "dead object" error on
		// the event.
		try {
			event.target;
		} catch (e) {
			return {};
		}

		const target = this.getEventTarget(event);

		const tooltipTarget = DOMUtils.shadowClosest(target, "[tooltip]");
		if (!tooltipTarget) return {};

		const tooltip = this.getTooltipFor(
			/** @type {Element} */ (tooltipTarget)
		);

		if (!tooltip || target == tooltip) {
			return {};
		}

		return {
			tooltip,
			tooltipTarget
		};
	}

	/**
	 * Determines how long we should take before showing the tooltip on-screen
	 * @param {import("third_party/dothq/gecko-types/lib").XULPopupElement} tooltip
	 */
	getTooltipShowDelay(tooltip) {
		let delay = 0;

		let tooltipDisplayLocation = this.tooltipDisplayLocation;

		// If the tooltip has requested a specific location,
		// override the user preference here.
		if (
			tooltip.getAttribute("location") &&
			this.TOOLTIP_LOCATION_NAMES[tooltip.getAttribute("location")]
		) {
			tooltipDisplayLocation =
				this.TOOLTIP_LOCATION_NAMES[tooltip.getAttribute("location")];
		}

		switch (tooltipDisplayLocation) {
			case this.TOOLTIP_LOCATION_STATUS:
				delay = this.tooltipStatusShowDelayMs;
				break;
			default:
				delay = this.tooltipFloatingShowDelayMs;
				break;
		}

		return delay;
	}

	/**
	 * Shows the tooltip
	 * @param {MouseEvent} event
	 */
	showTooltip(event) {
		const { tooltip, tooltipTarget } = this.getTooltipNodes(event);
		if (!tooltip) return;

		const tooltipShowDelayMs = this.getTooltipShowDelay(tooltip);

		this._tooltipTimer = setTimeout(
			this.launchTooltip.bind(this, event, tooltip, tooltipTarget),
			tooltipShowDelayMs
		);
	}

	/**
	 * Launches the tooltip node
	 * @param {MouseEvent} event
	 * @param {import("third_party/dothq/gecko-types/lib").XULPopupElement} tooltip
	 * @param {Element} [triggerNode]
	 */
	launchTooltip(event, tooltip, triggerNode) {
		const doc = tooltip.ownerDocument;

		const win = /** @type {ChromeWindow} */ (doc.ownerGlobal);

		// Check if we're in an active chrome window
		if (
			!doc ||
			doc?.ownerGlobal.browsingContext.isContent ||
			Services.focus.focusedWindow != win.top
		) {
			return;
		}

		this._currentTooltip = tooltip;
		this._currentTriggerNode = /** @type {Element} */ (
			triggerNode || event.target
		);

		Services.els.addSystemEventListener(
			tooltip,
			"popupshowing",
			this,
			false
		);

		Services.els.addSystemEventListener(
			tooltip,
			"popuphiding",
			this,
			false
		);

		Services.els.addSystemEventListener(doc, "wheel", this, true);
		Services.els.addSystemEventListener(doc, "mousedown", this, true);
		Services.els.addSystemEventListener(doc, "mouseup", this, true);
		Services.els.addSystemEventListener(doc, "keydown", this, true);

		Object.defineProperty(tooltip, "triggerNode", {
			configurable: true,
			get: () => {
				if (tooltip.state == "closed") {
					return null;
				}

				return this._currentTriggerNode;
			}
		});

		const tooltipAnchor = triggerNode.getAttribute("tooltipanchor") || "";

		if (tooltipAnchor) {
			tooltip.openPopup(
				this._currentTriggerNode,
				tooltipAnchor,
				0,
				0,
				false,
				false,
				event
			);
		} else {
			tooltip.openPopupAtScreen(
				this._screenX,
				this._screenY,
				false,
				event
			);
		}
	}

	/**
	 * Fired when the mouse moves
	 * @param {MouseEvent} event
	 */
	onMouseMove(event) {
		if (!this.showTooltips) {
			return;
		}

		const target = this.getEventTarget(event);
		if (!target) return;
		const { tooltipTarget } = this.getTooltipNodes(event);

		const newScreenX = event.screenX;
		const newScreenY = event.screenY;

		const isSameTarget = tooltipTarget == this._currentTriggerNode;

		const isNoAutoHide =
			this._currentTooltip &&
			this._currentTooltip.hasAttribute("noautohide");

		if (this.tooltipDisplayLocation == this.TOOLTIP_LOCATION_FLOATING) {
			const mouseMovedEnough =
				Math.abs(this._screenX - newScreenX) <=
					kTooltipMouseMoveTolerance &&
				Math.abs(this._screenY - newScreenY) <=
					kTooltipMouseMoveTolerance;

			// Filter out slight mouse movements so
			// light movements don't hide the tooltip
			if (
				this._currentTooltip &&
				isSameTarget &&
				(mouseMovedEnough || isNoAutoHide)
			) {
				return;
			}
		} else if (
			isNoAutoHide ||
			this.tooltipDisplayLocation == this.TOOLTIP_LOCATION_STATUS
		) {
			// Filter out mouse events that occur within
			// or outside the current target so the tooltip
			// stays open, even after moving the mouse around
			// the target bounds.
			//
			// If the tooltip supplies the `noautohide` attribute,
			// ensure we opt-in to this behaviour.
			if (
				this._currentTooltip &&
				this._currentTriggerNode &&
				isSameTarget &&
				DOMUtils.shadowContains(this._currentTriggerNode, target)
			) {
				return;
			}
		}

		this._screenX = newScreenX;
		this._screenY = newScreenY;
		this._previousMouseMoveTarget = target;

		this.killTooltipTimer();

		if (!isSameTarget) {
			this.hideTooltip();
			this._tooltipShownOnce = false;
		}

		if (
			(!this._currentTooltip && !this._tooltipShownOnce) ||
			!isSameTarget
		) {
			if (target) {
				this.showTooltip.call(this, event);
			}
			return;
		}

		// Hide the tooltip if it is currently showing.
		if (this._currentTooltip) {
			this.hideTooltip();
			this._tooltipShownOnce = true;
		}
	}

	/**
	 * Fired when the mouse leaves the bounds of a node
	 * @param {MouseEvent} event
	 */
	onMouseOut(event) {
		this._tooltipShownOnce = false;
		this._previousMouseMoveTarget = null;

		if (this._tooltipTimer && !this._currentTooltip) {
			this.killTooltipTimer();
			return;
		}

		if (this._currentTooltip) {
			const target = /** @type {any} */ (event).composedTarget;

			if (target != this._previousMouseMoveTarget) {
				this.hideTooltip();
			}
		}
	}

	/**
	 * Fired when the tooltip starts showing
	 */
	onTooltipShowing() {
		if (!this._currentTooltip) return;

		this._currentTriggerNode.setAttribute(
			"tooltipopen",
			this._currentTooltip.id || ""
		);
	}

	/**
	 * Adds tooltip support to a node
	 * @param {Node} node
	 */
	addTooltipSupport(node) {
		Services.els.addSystemEventListener(node, "mouseout", this, false);
		Services.els.addSystemEventListener(node, "mousemove", this, false);
		Services.els.addSystemEventListener(node, "mousedown", this, false);
		Services.els.addSystemEventListener(node, "mouseup", this, false);
		Services.els.addSystemEventListener(node, "dragstart", this, true);
	}

	/**
	 * Handles incoming events to the DotTooltipListenerChild
	 * @param {Event} event
	 */
	handleEvent(event) {
		if (event.type == "DOMContentLoaded") {
			this.addTooltipSupport(/** @type {Node} */ (event.target));
			return;
		}

		if (
			event.type == "wheel" ||
			event.type == "mousedown" ||
			event.type == "mouseup" ||
			event.type == "dragstart"
		) {
			this.hideTooltip();
			return;
		}

		// Hide the tooltip if a non-modifier key is pressed.
		if (event.type == "keydown") {
			if (
				this.keyEventHidesTooltip(/** @type {KeyboardEvent} */ (event))
			) {
				this.hideTooltip();
			}
			return;
		}

		if (event.type == "popupshowing") {
			this.onTooltipShowing();
			return;
		}

		if (event.type == "popuphiding") {
			this.destroyTooltip();
			return;
		}

		if (event.type == "mousemove") {
			this.onMouseMove(/** @type {MouseEvent} */ (event));
			return;
		}

		if (event.type == "mouseout") {
			this.onMouseOut(/** @type {MouseEvent} */ (event));
			return;
		}
	}
}
