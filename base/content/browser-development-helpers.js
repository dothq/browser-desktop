/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const DevelopmentHelpers = {
	init() {
		if (!Services.wm.getMostRecentWindow("Dot:DevDebugPopout")) {
			Services.ww.openWindow(
				null,
				"chrome://dot/content/dev-debug-popout.xhtml",
				"_blank",
				"chrome",
				null
			);
		}

		window.addEventListener("keydown", (e) => {
			if (e.ctrlKey && e.altKey && e.shiftKey && e.code == "KeyD") {
				if (
					document.documentElement.querySelector(
						"dev-preferences-popout"
					)
				) {
					document.documentElement
						.querySelector("dev-preferences-popout")
						.remove();
					return;
				}

				document.documentElement.appendChild(
					document.createElement("dev-preferences-popout")
				);
			}
		});
	}
};

DevelopmentHelpers.init();
