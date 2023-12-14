/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/. */

import { FrameLoader } from "./FrameLoader";

export interface ReceiveMessageArgument<D = any> {
    /**
     * The target of the message. Either an element owning the message manager, or message
     * manager itself if no element owns it.
     */
    target: any;

    /**
     * Message name.
     */
    name: string;

    sync: boolean;

    /**
     * Structured clone of the sent message data
     */
    data: D;

    /**
     * Same as .data, deprecated.
     * @deprecated
     */
    json: D;

    ports: Map<any, any>;

    targetFrameLoader: FrameLoader;
}