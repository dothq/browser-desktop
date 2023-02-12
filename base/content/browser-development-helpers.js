/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const { DevToolsServer } = ChromeUtils.importESModule(
	"resource://app/modules/DevToolsServer.sys.mjs"
);

const DevelopmentHelpers = {
	init() {
		const devtools = DevToolsServer.get();
		devtools.start();
	}
};

DevelopmentHelpers.init();
