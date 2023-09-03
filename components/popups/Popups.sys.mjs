/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * @typedef {import("third_party/dothq/gecko-types/lib").nsIDocShell} nsIDocShell
 * @typedef {import("third_party/dothq/gecko-types/lib").nsIURI} nsIURI
 */

export function Popups() {}

Popups.prototype = {
	classID: Components.ID("{604c5a0b-fdc1-4d2b-8d00-f7ec1bf3605f}"),
	QueryInterface: ChromeUtils.generateQI(["nsIDBPopupService"]),

	/**
	 * Opens a new popup
	 * @param {Window} win
	 * @param {any} openWindowInfo
	 * @param {number} flags
	 * @param {boolean} calledFromJS
	 * @param {nsIURI} uri
	 * @param {string} name
	 * @param {string} features
	 * @param {boolean} forceNoOpener
	 * @param {boolean} forceNoReferrer
	 * @param {boolean} isPopupRequested
	 * @param {any} loadState
	 */
	openPopup(
		win,
		openWindowInfo,
		flags,
		calledFromJS,
		uri,
		name,
		features,
		forceNoOpener,
		forceNoReferrer,
		isPopupRequested,
		loadState,
	) {
		const bcId = null;

		this._openPopupSync(
			win,
			openWindowInfo,
			flags,
			calledFromJS,
			uri,
			name,
			features,
			forceNoOpener,
			forceNoReferrer,
			isPopupRequested,
			loadState,
			bcId,
		);

		console.log("bcId", bcId);

		return bcId;
	},

	/**
	 * Opens a new popup synchronously
	 * @param {Window} win
	 * @param {any} openWindowInfo
	 * @param {number} flags
	 * @param {boolean} calledFromJS
	 * @param {nsIURI} uri
	 * @param {string} name
	 * @param {string} features
	 * @param {boolean} forceNoOpener
	 * @param {boolean} forceNoReferrer
	 * @param {boolean} isPopupRequested
	 * @param {any} loadState
	 * @param {any} returnBc - The return value browsingContext ID
	 */
	_openPopupSync(
		win,
		openWindowInfo,
		flags,
		calledFromJS,
		uri,
		name,
		features,
		forceNoOpener,
		forceNoReferrer,
		isPopupRequested,
		loadState,
		returnBc,
	) {
		this._openPopupAsync(
			win,
			openWindowInfo,
			flags,
			calledFromJS,
			uri,
			name,
			features,
			forceNoOpener,
			forceNoReferrer,
			isPopupRequested,
			loadState,
		).then((bc) => {
			returnBc = bc;
		});

		Services.tm.spinEventLoopUntilOrQuit(
			"popups/Popups.sys.mjs:openPopup",
			() => returnBc,
		);
	},

	/**
	 * Opens a new popup asynchronously
	 * @param {Window} win
	 * @param {any} openWindowInfo
	 * @param {number} flags
	 * @param {boolean} calledFromJS
	 * @param {nsIURI} uri
	 * @param {string} name
	 * @param {string} features
	 * @param {boolean} forceNoOpener
	 * @param {boolean} forceNoReferrer
	 * @param {boolean} isPopupRequested
	 * @param {any} loadState
	 */
	async _openPopupAsync(
		win,
		openWindowInfo,
		flags,
		calledFromJS,
		uri,
		name,
		features,
		forceNoOpener,
		forceNoReferrer,
		isPopupRequested,
		loadState,
	) {
		const actor = win.windowGlobalChild.getActor("DotPopupHandler");

		const IS_CONTENT =
			Services.appinfo.processType === Services.appinfo.PROCESS_TYPE_CONTENT;

		let bcId = null;

		if (IS_CONTENT) {
			bcId = await actor.sendQuery("Popup:Open", {
				openWindowInfo,
				flags,
				calledFromJS,
				uri,
				name,
				features,
				forceNoOpener,
				forceNoReferrer,
				isPopupRequested,
				loadState,
			});
		} else {
			console.error("Popups::openPopup: not in content process!");
			return null;
		}

		return bcId;
	},
};
