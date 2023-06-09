/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Cc } from "./Cc";
import { Ci } from "./Ci";
import { Cr } from "./Cr";
import { nsIException } from "./nsIException";

export interface nsIComponentManager {
	getClassObject(
		aClass: unknown /* todo: aClass: nsCIDRef */,
		aIID: unknown /* todo: aIID: nsIIDRef */,
		result: unknown /* todo: result: nsQIResult */
	): void;
	getClassObjectByContractID(
		aContractID: string,
		aIID: unknown /* todo: aIID: nsIIDRef */,
		result: unknown /* todo: result: nsQIResult */
	): void;
	createInstance(
		aClass: unknown /* todo: aClass: nsCIDRef */,
		aIID: unknown /* todo: aIID: nsIIDRef */,
		result: unknown /* todo: result: nsQIResult */
	): void;
	createInstanceByContractID(
		aContractID: string,
		aIID: unknown /* todo: aIID: nsIIDRef */,
		result: unknown /* todo: result: nsQIResult */
	): void;
	addBootstrappedManifestLocation(
		aLocation: unknown /* todo: aLocation: nsIFile */
	): void;
	removeBootstrappedManifestLocation(
		aLocation: unknown /* todo: aLocation: nsIFile */
	): void;
	getManifestLocations: any[];
	getComponentJSMs: string[];
	getComponentESModules: string[];
}

export interface nsIXPCComponents_Utils {
	printStderr(message: string): void;
	reportError(error: any, stack?: any): void;
	readonly Sandbox: unknown /* todo: Sandbox: nsIXPCComponents_utils_Sandbox */;
	createServicesCache: any;
	evalInSandbox(
		source: string,
		sandbox: any,
		version?: any,
		filename?: string,
		lineNo?: number,
		enforceFilenameRestrictions?: boolean
	): any;
	getUAWidgetScope(
		principal: unknown /* todo: principal: nsIPrincipal */
	): any;
	getSandboxMetadata(sandbox: any): any;
	setSandboxMetadata(sandbox: any, metadata: any): void;
	import(aResourceURI: string, targetObj?: any): any;
	isModuleLoaded(aResourceURI: string): boolean;
	isJSModuleLoaded(aResourceURI: string): boolean;
	isESModuleLoaded(aResourceURI: string): boolean;
	unload(registryLocation: string): void;
	importGlobalProperties(aPropertyList: any): void;
	getWeakReference(
		obj: any
	): unknown /* todo: getWeakReference: xpcIJSWeakReference */;
	forceGC: void;
	forceCC(
		aListener?: unknown /* todo: aListener: nsICycleCollectorListener */
	): void;
	createCCLogger: unknown /* todo: createCCLogger: nsICycleCollectorListener */;
	finishCC: void;
	ccSlice(budget: number): void;
	getMaxCCSliceTimeSinceClear: number;
	clearMaxCCTime: void;
	forceShrinkingGC: void;
	schedulePreciseGC(
		callback: unknown /* todo: callback: nsIScheduledGCCallback */
	): void;
	schedulePreciseShrinkingGC(
		callback: unknown /* todo: callback: nsIScheduledGCCallback */
	): void;
	unlinkGhostWindows: void;
	intentionallyLeak: void;
	getJSTestingFunctions: any;
	getFunctionSourceLocation(func: any): any;
	callFunctionWithAsyncStack(
		fn: any,
		stack: unknown /* todo: stack: nsIStackFrame */,
		asyncCause: string
	): any;
	getGlobalForObject(obj: any): any;
	isProxy(vobject: any): boolean;
	exportFunction(vfunction: any, vscope: any, voptions?: any): any;
	createObjectIn(vobj: any, voptions?: any): any;
	makeObjectPropsNormal(vobj: any): void;
	isDeadWrapper(obj: any): boolean;
	isRemoteProxy(val: any): boolean;
	recomputeWrappers(vobj?: any): void;
	setWantXrays(vscope: any): void;
	dispatch(runnable: any, scope?: any): void;
	strict_mode: boolean;
	readonly isInAutomation: boolean;
	exitIfInAutomation: void;
	crashIfNotInAutomation: void;
	setGCZeal(zeal: number): void;
	nukeSandbox(obj: any): void;
	blockScriptForGlobal(global: any): void;
	unblockScriptForGlobal(global: any): void;
	isOpaqueWrapper(obj: any): boolean;
	isXrayWrapper(obj: any): boolean;
	waiveXrays(aVal: any): any;
	unwaiveXrays(aVal: any): any;
	getClassName(aObj: any, aUnwrap: boolean): string;
	getDOMClassInfo(
		aClassName: string
	): unknown /* todo: getDOMClassInfo: nsIClassInfo */;
	getIncumbentGlobal(callback?: any): any;
	getDebugName(obj: any): string;
	getWatchdogTimestamp(
		aCategory: string
	): unknown /* todo: getWatchdogTimestamp: PRTime */;
	getJSEngineTelemetryValue: any;
	cloneInto(value: any, scope: any, options?: any): any;
	getWebIDLCallerPrincipal: unknown /* todo: getWebIDLCallerPrincipal: nsIPrincipal */;
	getObjectPrincipal(
		obj: any
	): unknown /* todo: getObjectPrincipal: nsIPrincipal */;
	getRealmLocation(obj: any): string;
	now: number;
	readUTF8File(file: unknown /* todo: file: nsIFile */): string;
	readUTF8URI(url: unknown /* todo: url: nsIURI */): string;
	createSpellChecker: unknown /* todo: createSpellChecker: nsIEditorSpellCheck */;
	createCommandLine(
		args: string[],
		workingDir: unknown /* todo: workingDir: nsIFile */,
		state: number
	): unknown /* todo: createCommandLine: nsISupports */;
	createCommandParams: unknown /* todo: createCommandParams: nsICommandParams */;
	createLoadContext: unknown /* todo: createLoadContext: nsILoadContext */;
	createPrivateLoadContext: unknown /* todo: createPrivateLoadContext: nsILoadContext */;
	createPersistentProperties: unknown /* todo: createPersistentProperties: nsIPersistentProperties */;
	createDocumentEncoder(
		contentType: string
	): unknown /* todo: createDocumentEncoder: nsIDocumentEncoder */;
	createHTMLCopyEncoder: unknown /* todo: createHTMLCopyEncoder: nsIDocumentEncoder */;
	readonly loadedModules: string[];
	readonly loadedJSModules: string[];
	readonly loadedESModules: string[];
	getModuleImportStack(aLocation: string): string;
}

export interface Components {
	Constructor: any;
	Exception: any;
	ID: any;
	classes: Cc;
	interfaces: Ci;
	results: Cr;
	returnCode: number;
	stack: nsIException;
	manager: nsIComponentManager;
	utils: nsIXPCComponents_Utils;
}
