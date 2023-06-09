/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as Gecko from ".";

export interface Cc {
	"@mozilla.org/process/environment;1": {
		getService(service: Gecko.nsIEnvironment): Gecko.Environment;
	};
	"@mozilla.org/filepicker;1": {
		createInstance(
			instance: Gecko.nsIFilePicker
		): Gecko.FilePicker;
	};
}
