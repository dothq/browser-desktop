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
				"popuphiding",
				this,
				false
			);

			this.killTooltipTimer();

			this._currentTooltip = null;
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
	 * Shows the tooltip
	 * @param {MouseEvent} event
	 */
	showTooltip(event) {
		const target = this.getEventTarget(event);

		const tooltipTarget = DOMUtils.shadowClosest(target, "[tooltip]");
		if (!tooltipTarget) return;

		const tooltipNode = this.getTooltipFor(
			/** @type {Element} */ (tooltipTarget)
		);

		if (!tooltipNode || target == tooltipNode) {
			return;
		}

		const doc = tooltipNode.ownerDocument;

		const win = /** @type {ChromeWindow} */ (doc.ownerGlobal);

		// Check if we're in an active chrome window
		if (
			!doc ||
			doc.ownerGlobal.browsingContext.isContent ||
			Services.focus.focusedWindow != win.top
		) {
			return;
		}

		this.launchTooltip(event, tooltipNode, tooltipTarget);
	}

	/**
	 * Launches the tooltip node
	 * @param {MouseEvent} event
	 * @param {import("third_party/dothq/gecko-types/lib").XULPopupElement} tooltip
	 * @param {EventTarget} [triggerNode]
	 */
	launchTooltip(event, tooltip, triggerNode) {
		const doc = tooltip.ownerDocument;

		this._currentTooltip = tooltip;

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

		const resolvedTriggerNode = /** @type {Element} */ (
			triggerNode || event.target
		);

		Object.defineProperty(tooltip, "triggerNode", {
			configurable: true,
			get: () => {
				if (tooltip.state == "closed") {
					return null;
				}

				return resolvedTriggerNode;
			}
		});

		const tooltipAnchor =
			resolvedTriggerNode.getAttribute("tooltipanchor") || "";

		if (tooltipAnchor) {
			tooltip.openPopup(
				resolvedTriggerNode,
				tooltipAnchor,
				0,
				-kTooltipMouseTopMargin,
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

		const newScreenX = event.screenX;
		const newScreenY = event.screenY;

		const isSameTarget =
			this._previousMouseMoveTarget &&
			this._previousMouseMoveTarget == target;

		// Filter out slight mouse movements so
		// light movements don't hide the tooltip
		if (
			this._currentTooltip &&
			isSameTarget &&
			Math.abs(this._screenX - newScreenX) <=
				kTooltipMouseMoveTolerance &&
			Math.abs(this._screenY - newScreenY) <= kTooltipMouseMoveTolerance
		) {
			return;
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
				this._tooltipTimer = setTimeout(
					this.showTooltip.bind(this, event),
					500
				);
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
