/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

export class PromptParent extends JSWindowActorParent {
	/**
	 * Receive a message
	 * @param {import("third_party/dothq/gecko-types/lib").ReceiveMessageArgument} message
	 */
	async receiveMessage(message) {
		const args = message.data;

		switch (message.name) {
			case "Prompt:Open":
				console.log(message);
				break;
		}
	}
}
