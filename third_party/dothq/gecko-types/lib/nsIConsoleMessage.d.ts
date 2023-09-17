/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

export interface nsIConsoleMessage {
    /** Log level constants. */
    debug: 0;
    info: 1;
    warn: 2;
    error: 3;

    /**
     * The log level of this message.
     */
    readonly logLevel: number;

    /**
     * The time (in milliseconds from the Epoch) that the message instance
     * was initialised.
     * The timestamp is initialized as JS_now/1000 so that it can be
     * compared to Date.now in Javascript.
     */
    readonly timeStamp: number;

    /**
     * The time (in microseconds from the Epoch) that the message instance
     * was initialised.
     * The timestamp is initialized as JS_now.
     */
    readonly microSecondTimeStamp: number;

    readonly message: string;

    isForwardedFromContentProcess: boolean;

    toString(): string;
}