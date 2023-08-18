/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { nsIChannel } from "./nsIChannel";

export interface nsIHttpActivityObserver {
    /**
     * observe activity from the http transport
     *
     * @param httpChannel
     *        nsISupports interface for the the http channel that
     *        generated this activity
     * @param activityType
     *        The value of this aActivityType will be one of
     *          ACTIVITY_TYPE_SOCKET_TRANSPORT or
     *          ACTIVITY_TYPE_HTTP_TRANSACTION
     * @param activitySubtype
     *        The value of this aActivitySubtype, will be depend
     *        on the value of aActivityType. When aActivityType
     *        is ACTIVITY_TYPE_SOCKET_TRANSPORT
     *          aActivitySubtype will be one of the
     *          nsISocketTransport::STATUS_???? values defined in
     *          nsISocketTransport.idl
     *        OR when aActivityType
     *        is ACTIVITY_TYPE_HTTP_TRANSACTION
     *          aActivitySubtype will be one of the
     *          nsIHttpActivityObserver::ACTIVITY_SUBTYPE_???? values
     *          defined below
     * @param timestamp
     *        microseconds past the epoch of Jan 1, 1970
     * @param extraSizeData
     *        Any extra size data optionally available with
     *        this activity
     * @param extraStringData
     *        Any extra string data optionally available with
     *        this activity
     */
    observeActivity(httpChannel: nsIChannel,
        activityType: number,
        activitySubtype: number,
        timestamp: number,
        extraSizeData: number,
        extraStringData: string): void;

    /**
     * This attribute is true when this interface is active and should
     * observe http activities. When false, observeActivity() should not
     * be called. It is present for compatibility reasons and should be
     * implemented only by nsHttpActivityDistributor.
     */
    readonly isActive: boolean;

    /**
     * This function is for internal use only. Every time a http transaction
     * is created in socket process, we use this function to set the value of
     * |isActive|. We need this since the real value of |isActive| is
     * only available in parent process.
     */
    setIsActive(actived: boolean): void;

    /**
     * This function is used when the real http channel is not available.
     * We use the information in |HttpActivityArgs| to get the http channel or
     * create a |NullHttpChannel|.
     *
     * @param aArgs
     *        See the definition of |HttpActivityArgs| in PSocketProcess.ipdl.
     */

    observeActivityWithArgs(args: any /** @todo HttpActivityArgs */,
        activityType: number,
        activitySubtype: number,
        timestamp: number,
        extraSizeData: number,
        extraStringData: string): void;

    /**
     * This function is for testing only. We use this function to observe the
     * activities of HTTP connections. To receive this notification,
     * observeConnection should be set to true.
     */

    observeConnectionActivity(host: string,
        port: number,
        ssl: boolean,
        hasECH: boolean,
        isHttp3: boolean,
        activityType: number,
        activitySubtype: number,
        timestamp: number,
        extraSizeData: number,
        extraStringData: string): void;

    ACTIVITY_TYPE_SOCKET_TRANSPORT: 0x0001;
    ACTIVITY_TYPE_HTTP_TRANSACTION: 0x0002;
    ACTIVITY_TYPE_HTTP_CONNECTION: 0x0003;

    ACTIVITY_SUBTYPE_REQUEST_HEADER: 0x5001;
    ACTIVITY_SUBTYPE_REQUEST_BODY_SENT: 0x5002;
    ACTIVITY_SUBTYPE_RESPONSE_START: 0x5003;
    ACTIVITY_SUBTYPE_RESPONSE_HEADER: 0x5004;
    ACTIVITY_SUBTYPE_RESPONSE_COMPLETE: 0x5005;
    ACTIVITY_SUBTYPE_TRANSACTION_CLOSE: 0x5006;
    ACTIVITY_SUBTYPE_PROXY_RESPONSE_HEADER: 0x5007;
    ACTIVITY_SUBTYPE_DNSANDSOCKET_CREATED: 0x5008;
    ACTIVITY_SUBTYPE_SPECULATIVE_DNSANDSOCKET_CREATED: 0x5009;
    ACTIVITY_SUBTYPE_ECH_SET: 0x500A;
    ACTIVITY_SUBTYPE_CONNECTION_CREATED: 0x500B;

    /**
     *  When aActivityType is ACTIVITY_TYPE_SOCKET_TRANSPORT
     *  and aActivitySubtype is STATUS_SENDING_TO
     *  aExtraSizeData will contain the count of bytes sent
     *  There may be more than one of these activities reported
     *  for a single http transaction, each aExtraSizeData
     *  represents only that portion of the total bytes sent
     *
     *  When aActivityType is ACTIVITY_TYPE_HTTP_TRANSACTION
     *  and aActivitySubtype is ACTIVITY_SUBTYPE_REQUEST_HEADER
     *  aExtraStringData will contain the text of the header
     *
     *  When aActivityType is ACTIVITY_TYPE_HTTP_TRANSACTION
     *  and aActivitySubtype is ACTIVITY_SUBTYPE_RESPONSE_HEADER
     *  aExtraStringData will contain the text of the header
     *
     *  When aActivityType is ACTIVITY_TYPE_HTTP_TRANSACTION
     *  and aActivitySubtype is ACTIVITY_SUBTYPE_RESPONSE_COMPLETE
     *  aExtraSizeData will contain the count of total bytes received
     */
}
