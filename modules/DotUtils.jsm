/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const EXPORTED_SYMBOLS = ["DotUtils"];

const DotUtils = {
	match(expression, patterns) {
		const evaluated = expression;
		const keys = Object.keys(patterns);

		for (const k of keys) {
			if (evaluated == k || k == "_") {
				patterns[k](evaluated);

				break;
			}
		}
	}
};
