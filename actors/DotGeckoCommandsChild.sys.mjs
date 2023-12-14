/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

export class GeckoCommandsChild extends JSWindowActorChild {
	constructor() {
		super();
	}

	_canCopy = true;

	get canCopy() {
		return this._canCopy;
	}

	set canCopy(newValue) {
		this._canCopy = newValue;
		this.sendAsyncMessage("GeckoCommands:CommandUpdate", {
			command: "copy"
		});
	}

	_canCut = true;
	_canPaste = true;

	/**
	 * Determines whether the user has selected something on the page
	 */
	get hasSelection() {
		return !!this.contentWindow?.getSelection().toString().length;
	}

	/**
	 * Handles incoming events from the connected page
	 * @param {Event} event
	 */
	handleEvent(event) {
		switch (event.type) {
			case "focus":
			case "blur": {
				if (!(event.target instanceof HTMLInputElement)) {
					return;
				}

				this._canCopy = event.type == "focus" && this.hasSelection;
				this._canCut = event.type == "focus" && this.hasSelection;
				break;
			}
		}
	}

	/**
	 * @param {import("third_party/dothq/gecko-types/lib").ReceiveMessageArgument} message
	 */
	receiveMessage(message) {
		switch (message.name) {
			case "GeckoCommands:ExecuteCommand": {
				this.docShell.doCommand(message.data.command);

				break;
			}
		}
	}
}
