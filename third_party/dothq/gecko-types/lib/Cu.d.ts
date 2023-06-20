/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/. */

export interface Cu {
	import: <T extends any>(module: string) => { [key: string]: T };
	exportFunction: (
		fn: Function,
		scope: object,
		options?: object
	) => void;
	cloneInto: (value: any, scope: object, options?: object) => void;
	isInAutomation: boolean;
	now: () => number;
    getGlobalForObject(obj: any): any;
}
