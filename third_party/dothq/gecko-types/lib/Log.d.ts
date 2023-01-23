/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { nsIException } from "./nsIException";

export interface Log {
	repository: LogRepository;
	exceptionStr(e: nsIException): string;
	stackTrace(e: nsIException): string;
}

export interface LogRepository {
	rootLogger: LogInstance;

	/**
	 * Obtain a named Logger.
	 *
	 * The returned Logger instance for a particular name is shared among
	 * all callers. In other words, if two consumers call getLogger("foo"),
	 * they will both have a reference to the same object.
	 *
	 * @return Logger
	 */
	getLogger(name: string): LogInstance;

	/**
	 * Obtain a Logger that logs all string messages with a prefix.
	 *
	 * A common pattern is to have separate Logger instances for each instance
	 * of an object. But, you still want to distinguish between each instance.
	 * Since Log.repository.getLogger() returns shared Logger objects,
	 * monkeypatching one Logger modifies them all.
	 *
	 * This function returns a new object with a prototype chain that chains
	 * up to the original Logger instance. The new prototype has log functions
	 * that prefix content to each message.
	 *
	 * @param name
	 *        (string) The Logger to retrieve.
	 * @param prefix
	 *        (string) The string to prefix each logged message with.
	 */
	getLoggerWithMessagePrefix(
		name: string,
		prefix: string
	): LogInstance;
}

export interface LogInstance {
	name: string;
	level: number;
	parent: Log;
	manageLevelFromPref(prefName: string): void;
	updateAppenders(): void;
	addAppender(appender: any): void;
	removeAppender(appender: any): void;

	log(level: number, string: string, params: any): void;

	fatal(string: string, ...params: any[]): void;
	error(string: string, ...params: any[]): void;
	warn(string: string, ...params: any[]): void;
	info(string: string, ...params: any[]): void;
	config(string: string, ...params: any[]): void;
	debug(string: string, ...params: any[]): void;
	trace(string: string, ...params: any[]): void;
}
