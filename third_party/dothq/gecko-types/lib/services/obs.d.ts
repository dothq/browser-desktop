/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/. */

export interface ServicesObs {
	addObserver: (
		observer: object,
		type: string,
		holdWeak?: boolean
	) => void;
	removeObserver: (observer: object, type: string) => void;
	notifyObservers: (subject: any, topic: string) => void;
}
