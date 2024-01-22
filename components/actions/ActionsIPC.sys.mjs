/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const { ActionsMessenger } = ChromeUtils.importESModule(
	"resource://gre/modules/ActionsMessenger.sys.mjs"
);

/**
 * @typedef {CustomEvent<{}> & { detail: { id: string; args?: T, messageId: string, messenger: typeof ActionsMessenger["prototype"] }, target: ReturnType<typeof BrowserCustomizableContextMixin<typeof Element>>["prototype"] }} ActionDispatchEvent
 * @template T
 */

/**
 * @typedef {CustomEvent<{}> & { detail: { id: string; data?: T, messageId: string }, target: ReturnType<typeof BrowserCustomizableContextMixin<typeof Element>>["prototype"] }} ActionReplyEvent
 * @template T
 */

export class ActionsIPC {
	ACTIONS_DISPATCH_EVENT = "Actions::Dispatch";
	ACTIONS_REPLY_EVENT = "Actions::Reply";

	/** @type {ReturnType<typeof BrowserCustomizableContextMixin<typeof Element>>["prototype"]} */
	area = null;

	/**
	 * @param {ReturnType<typeof BrowserCustomizableContextMixin<typeof Element>>["prototype"]} area
	 */
	constructor(area) {
		this.area = area;
	}
}
