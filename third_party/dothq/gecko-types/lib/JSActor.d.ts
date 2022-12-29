/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/. */

import { ReceiveMessageArgument } from "./ReceiveMessageArgument";

export class JSActor {
    sendAsyncMessage(messageName: string, obj?: any): void;

    sendQuery(messageName: string, obj?: any): Promise<any>;

    receiveMessage(message?: ReceiveMessageArgument): void;

    readonly name: string;
}