/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/. */

import { AllMozModules, AllMozResourceBindings } from "mozbuild";

export interface ProcessActorSidedOptions {
	moduleURI: string;
	esModuleURI: string;
}

export interface ProcessActorChildOptions
	extends ProcessActorSidedOptions {
	observers: string[];
}

export interface ProcessActorOptions {
	remoteTypes: string[];
	includeParent: boolean;
	parent: ProcessActorSidedOptions;
	child: ProcessActorChildOptions;
}

export interface ProfilerMarkerOptions {
	startTime: unknown /* todo: startTime: DOMHighResTimeStamp */;
	captureStack: boolean;
	category: string;
	innerWindowId: number;
}

type ResolvedModules = AllMozModules;

export interface ChromeUtils {
	/**
	 * Synchronously loads and evaluates the js file located at
	 * 'resourceURI' with a new, fully privileged global object.
	 *
	 * @param resourceURI A resource:// URI string to load the module from.
	 * @returns the module code's global object.
	 *
	 */
	import: <T = any, R = keyof AllMozResourceBindings>(
		resourceURI: R
	) => { [key: string]: T };
	importESModule: <Resource extends keyof AllMozResourceBindings>(
		resourceURI: Resource
	) => Pick<AllMozModules, AllMozResourceBindings[Resource]> &
		Record<string, any>;
	defineModuleGetter: (
		target: any,
		variable: string,
		path: string
	) => void;
	generateQI: (contractIDs: string[]) => any;
	defineESModuleGetters<Paths extends keyof AllMozModules>(
		target: object,
		bindings: Record<Paths, string>
	): void;
	unregisterProcessActor: (name: string) => void;
	unregisterWindowActor: (name: string) => void;
	registerProcessActor: (
		name: string,
		options?: ProcessActorOptions
	) => void;
	registerWindowActor: (
		name: string,
		options?: ProcessActorOptions
	) => void;
	idleDispatch: (
		callback: any,
		options?: { timeout: number }
	) => undefined;
	addProfilerMarker: (
		name: string,
		options?: ProfilerMarkerOptions | DOMHighResTimeStamp,
		text?: string
	) => undefined;
    getClassName(object: object): string;
}
