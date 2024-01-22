/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * @typedef {import("components/actions/ActionsIPC.sys.mjs").ActionDispatchEvent<T>} ActionDispatchEvent
 * @template T
 */

const { Action } = ChromeUtils.importESModule(
	"resource://gre/modules/Action.sys.mjs"
);

export class BrowserPanelsOpenAction extends Action {
	static id = "browser.panels.open";

	constructor() {
		super();
	}

	/**
	 * The name of this action
	 */
	get name() {
		return "Open a panel";
	}

	/**
	 * Performs this action
	 * @param {ActionDispatchEvent<{ id: string; x?: number; y?: number; opener?: Element; anchor?: any; args?: Record<string, any> }>} event
	 */
	run(event) {
		const { args } = event.detail;

		const win = event.target.ownerGlobal;
		const { gDot } = win;

		const panel = gDot.panels.getPanelById(args.id);
		panel.openPanel({
			x: args.x,
			y: args.y,

			element: args.opener,
			anchor: args.anchor,

			args: event.target.context
		});
	}
}
