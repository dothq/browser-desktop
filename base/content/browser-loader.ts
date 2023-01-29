/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

async function loadESMSubScript(pathname: string, target: object) {
	return import(pathname)
		.then((exports) => {
			for (const [key, value] of Object.entries(exports)) {
				target[key] = value;
			}
		})
		.catch((err) => console.error(err));
}
