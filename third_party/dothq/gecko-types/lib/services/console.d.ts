/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { nsIConsoleListener } from "../nsIConsoleListener";
import { nsIConsoleMessage } from "../nsIConsoleMessage";

export interface ServicesConsole {
    logMessage(message: nsIConsoleMessage): void;

    // This helper function executes `function` and redirects any exception
    // that may be thrown while running it to the DevTools Console currently
    // debugging `targetGlobal`.
    //
    // This helps flag the nsIScriptError with a particular innerWindowID
    // which is especially useful for WebExtension content scripts
    // where script are running in a Sandbox whose prototype is the content window.
    // We expect content script exception to be flaged with the content window
    // innerWindowID in order to appear in the tab's DevTools.
    callFunctionAndLogException(targetGlobal: any, func: any): any;

    // This is a variant of LogMessage which allows the caller to determine
    // if the message should be output to an OS-specific log. This is used on
    // B2G to control whether the message is logged to the android log or not.
    logMessageWithMode(message: nsIConsoleMessage,
                            mode: number): void;

    /**
     * Convenience method for logging simple messages.
     */
    logStringMessage(message: string): void;

    /**
     * Get an array of all the messages logged so far.
     */
    getMessageArray(): nsIConsoleMessage[];

    /**
     * To guard against stack overflows from listeners that could log
     * messages (it's easy to do this inadvertently from listeners
     * implemented in JavaScript), we don't call any listeners when
     * another error is already being logged.
     */
    registerListener(listener: nsIConsoleListener): void;

    /**
     * Each registered listener should also be unregistered.
     */
    unregisterListener(listener: nsIConsoleListener): void;

    /**
     * Clear the message buffer (e.g. for privacy reasons).
     */
    reset(): void;

    /**
     * Clear the message buffer for a given window.
     */
    resetWindow(windowInnerId: number): void;
}