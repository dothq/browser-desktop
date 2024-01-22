/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

export class ActionsMessenger {
	/**
	 * A map of outbound actions messages
	 * @type {Map<string, any>}
	 */
	outbound = new Map();

	/**
	 * A map of inbound actions messages
	 * @type {Map<string, any>}
	 */
	inbound = new Map();

	/**
	 * A map of reply promises
	 * @type {Map<string, Set<(value: any) => void>>}
	 */
	#replyPromiseResolvers = new Map();

	/**
	 * Waits for a reply from an actions message
	 * @template [T=any]
	 * @param {string} messageId
	 * @returns {Promise<T>}
	 */
	async awaitCorrespondence(messageId) {
		if (!this.#replyPromiseResolvers.has(messageId)) {
			this.#replyPromiseResolvers.set(messageId, new Set());
		}

		const promisesResolvers = this.#replyPromiseResolvers.get(messageId);

		const promise = new Promise((resolve) => {
			promisesResolvers.add(resolve);
		});

		return await promise;
	}

	/**
	 * Resolves an actions message
	 * @param {string} messageId
	 * @param {any} data
	 */
	resolveMessage(messageId, data) {
		if (!this.outbound.has(messageId)) {
			throw new Error(`No outbound message with ID '${messageId}'!`);
		}

		this.outbound.delete(messageId);
		this.inbound.set(messageId, data);

		const promiseResolvers = this.#replyPromiseResolvers.get(messageId);

		if (promiseResolvers) {
			promiseResolvers.forEach((resolve) => {
				resolve(data);
				promiseResolvers.delete(resolve);
			});

			this.#replyPromiseResolvers.delete(messageId);
		}

		this.inbound.delete(messageId);
	}

	/**
	 * Registers a new actions message
	 * @param {string} eventId
	 * @param {any} data
	 */
	createEventMessage(eventId, data) {
		const messageId = Services.uuid.generateUUID().toString();

		const eventDetail = {
			...data,
			messenger: this,
			messageId
		};

		const event = new CustomEvent(eventId, {
			detail: eventDetail
		});

		this.outbound.set(messageId, eventDetail);

		return { event, messageId };
	}

	/**
	 *
	 * @param {*} host
	 */
	constructor(host) {}
}
