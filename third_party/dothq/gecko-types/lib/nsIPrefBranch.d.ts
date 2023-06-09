/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/. */

export type PrefObserverFunction = (
	aSubject: nsIPrefBranch,
	aTopic: "nsPref:changed",
	aData: string
) => unknown;
export type PrefObserver =
	| PrefObserverFunction
	| { observe: PrefObserverFunction };

export type GetPref<T> = (prefName: string, defaultValue?: T) => T;
export type SetPref<T> = (prefName: string, value?: T) => T;
export type nsIPrefBranch = {
	clearUserPref: (prefName: string) => void;
	getStringPref: GetPref<string>;
	setStringPref: SetPref<string>;
	getCharPref: GetPref<string>;
	setCharPref: SetPref<string>;
	getIntPref: GetPref<number>;
	setIntPref: SetPref<number>;
	getBoolPref: GetPref<boolean>;
	setBoolPref: SetPref<boolean>;
	lockPref: (prefName: string) => void;
	addObserver: (
		aDomain: string,
		aObserver: PrefObserver,
		aHoldWeak?: boolean
	) => void;
	removeObserver: (
		aDomain: string,
		aObserver: PrefObserver
	) => void;
	getDefaultBranch: (prefRoot: string) => nsIPrefBranch;
};
