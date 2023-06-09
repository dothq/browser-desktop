/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { DevToolsSocketStatus } from "../../third_party/dothq/gecko-types/lib";

var { DevToolsSocketStatus } = ChromeUtils.importESModule(
	"resource://devtools/shared/security/DevToolsSocketStatus.sys.mjs"
);

export const BrowserRemoteControl = {
	observe(subject, topic, data) {
		this.updateVisualCue();
	},

	updateVisualCue() {
		// Disable updating the remote control cue for performance tests,
		// because these could fail due to an early initialization of Marionette.
		const disableRemoteControlCue = Services.prefs.getBoolPref(
			"browser.chrome.disableRemoteControlCueForTests",
			false
		);

		if (disableRemoteControlCue && Cu.isInAutomation) {
			return;
		}

		const doc = document.documentElement;

		if (this.isBeingControlled()) {
			doc.setAttribute("remotecontrol", "true");
		} else {
			doc.removeAttribute("remotecontrol");
		}
	},

	isBeingControlled() {
		return (
			DevToolsSocketStatus.hasSocketOpened({
				excludeBrowserToolboxSockets: true
			}) ||
			Marionette.running ||
			RemoteAgent.running
		);
	}
};
