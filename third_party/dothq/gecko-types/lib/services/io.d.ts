/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/. */

import { nsIURI } from "../nsIURI";

export interface ServicesIo {
	/**
	 * Returns a protocol handler for a given URI scheme.
	 *
	 * @param aScheme the URI scheme
	 * @return reference to corresponding nsIProtocolHandler
	 */
	getProtocolHandler(
		scheme: string
	): unknown /* @todo nsIProtocolHandler */;

	/**
	 * Returns the protocol flags for a given scheme.
	 *
	 * @param aScheme the URI scheme
	 * @return protocol flags for the corresponding protocol
	 */
	getProtocolFlags(scheme: string): number;

	/**
	 * Returns the dynamic protocol flags for a given URI.
	 *
	 * @param aURI the URI to get all dynamic flags for
	 * @return protocol flags for that URI
	 */
	getDynamicProtocolFlags(uri: nsIURI): number;

	/**
	 * Returns the default port for a given scheme.
	 *
	 * @param aScheme the URI scheme
	 * @return default port for the corresponding protocol
	 */
	getDefaultPort(scheme): number;

	/**
	 * This method constructs a new URI based on the scheme of the URI spec.
	 * QueryInterface can be used on the resulting URI object to obtain a more
	 * specific type of URI.
	 */
	newURI(
		spec: string,
		originCharset?: string,
		baseURI?: nsIURI
	): nsIURI;

	/**
	 * This method constructs a new URI from a nsIFile.
	 *
	 * @param aFile specifies the file path
	 * @return reference to a new nsIURI object
	 *
	 * Note: in the future, for perf reasons we should allow
	 * callers to specify whether this is a file or directory by
	 * splitting this  into newDirURI() and newActualFileURI().
	 */
	newFileURI(file: any /* @todo: file: nsIFile */): nsIURI;

	/**
	 * Converts an internal URI (e.g. one that has a username and password in
	 * it) into one which we can expose to the user, for example on the URL bar.
	 *
	 * @param  aURI The URI to be converted.
	 * @return nsIURI The converted, exposable URI.
	 */
	createExposableURI(uri: nsIURI): nsIURI;

	/**
	 * Creates a channel for a given URI.
	 *
	 * @param uri
	 *        nsIURI from which to make a channel
	 * @param loadingNode
	 * @param loadingPrincipal
	 * @param triggeringPrincipal
	 * @param securityFlags
	 * @param contentPolicyType
	 *        These will be used as values for the nsILoadInfo object on the
	 *        created channel. For details, see nsILoadInfo in nsILoadInfo.idl
	 * @return reference to the new nsIChannel object
	 *
	 * Please note, if you provide both a loadingNode and a loadingPrincipal,
	 * then loadingPrincipal must be equal to loadingNode->NodePrincipal().
	 * But less error prone is to just supply a loadingNode.
	 *
	 * Keep in mind that URIs coming from a webpage should *never* use the
	 * systemPrincipal as the loadingPrincipal.
	 */
	newChannelFromURI(
		uri: nsIURI,
		loadingNode: Node,
		loadingPrincipal: any /* todo: loadingPrincipal: nsIPrincipal */,
		triggeringPrincipal: any /* todo: triggeringPrincipal: nsIPrincipal */,
		securityFlags: number,
		contentPolicyType: any /* todo: contentPolicyType: nsContentPolicyType */
	): unknown /* @todo nsIChannel */;

	/**
	 * Equivalent to newChannelFromURI(aURI, aLoadingNode, ...)
	 */
	newChannelFromURIWithLoadInfo(
		uri: nsIURI,
		loadInfo: any /* @todo: loadInfo: nsILoadInfo */
	): unknown /* @todo nsIChannel */;

	/**
	 * Equivalent to newChannelFromURI(newURI(...))
	 */
	newChannel(
		spec: string,
		originCharset: string,
		baseURI: nsIURI,
		loadingNode: Node,
		loadingPrincipal: any /* todo: loadingPrincipal: nsIPrincipal */,
		triggeringPrincipal: any /* todo: triggeringPrincipal: nsIPrincipal */,
		securityFlags: number,
		contentPolicyType: any /* todo: contentPolicyType: nsContentPolicyType */
	): unknown /* @todo nsIChannel */;

	/**
	 * Creates a WebTransport.
	 */
	newWebTransport(): unknown /* @todo nsIWebTransport */;

	/**
	 * Returns true if networking is in "offline" mode. When in offline mode,
	 * attempts to access the network will fail (although this does not
	 * necessarily correlate with whether there is actually a network
	 * available -- that's hard to detect without causing the dialer to
	 * come up).
	 *
	 * Changing this fires observer notifications ... see below.
	 */
	offline: boolean;

	/**
	 * Returns false if there are no interfaces for a network request
	 */
	readonly connectivity: boolean;

	/**
	 * Checks if a port number is banned. This involves consulting a list of
	 * unsafe ports, corresponding to network services that may be easily
	 * exploitable. If the given port is considered unsafe, then the protocol
	 * handler (corresponding to aScheme) will be asked whether it wishes to
	 * override the IO service's decision to block the port. This gives the
	 * protocol handler ultimate control over its own security policy while
	 * ensuring reasonable, default protection.
	 *
	 * @see nsIProtocolHandler::allowPort
	 */
	allowPort(port: number, scheme: string): boolean;

	/**
	 * Utility to extract the scheme from a URL string, consistently and
	 * according to spec (see RFC 2396).
	 *
	 * NOTE: Most URL parsing is done via nsIURI, and in fact the scheme
	 * can also be extracted from a URL string via nsIURI.  This method
	 * is provided purely as an optimization.
	 *
	 * @param aSpec the URL string to parse
	 * @return URL scheme, lowercase
	 *
	 * @throws NS_ERROR_MALFORMED_URI if URL string is not of the right form.
	 */
	extractScheme(urlString): string;

	/**
	 * Checks if a URI host is a local IPv4 or IPv6 address literal.
	 *
	 * @param nsIURI the URI that contains the hostname to check
	 * @return true if the URI hostname is a local IP address
	 */
	hostnameIsLocalIPAddress(uri: nsIURI): boolean;

	/**
	 * Checks if a URI host is a shared IPv4 address literal.
	 *
	 * @param nsIURI the URI that contains the hostname to check
	 * @return true if the URI hostname is a shared IP address
	 */
	hostnameIsSharedIPAddress(uri: nsIURI): boolean;

	/**
	 * While this is set, IOService will monitor an nsINetworkLinkService
	 * (if available) and set its offline status to "true" whenever
	 * isLinkUp is false.
	 *
	 * Applications that want to control changes to the IOService's offline
	 * status should set this to false, watch for network:link-status-changed
	 * broadcasts, and change nsIIOService::offline as they see fit. Note
	 * that this means during application startup, IOService may be offline
	 * if there is no link, until application code runs and can turn off
	 * this management.
	 */
	manageOfflineStatus: boolean;

	/**
	 * Creates a channel for a given URI.
	 *
	 * @param aURI
	 *        nsIURI from which to make a channel
	 * @param aProxyURI
	 *        nsIURI to use for proxy resolution. Can be null in which
	 *        case aURI is used
	 * @param aProxyFlags flags from nsIProtocolProxyService to use
	 *        when resolving proxies for this new channel
	 * @param aLoadingNode
	 * @param aLoadingPrincipal
	 * @param aTriggeringPrincipal
	 * @param aSecurityFlags
	 * @param aContentPolicyType
	 *        These will be used as values for the nsILoadInfo object on the
	 *        created channel. For details, see nsILoadInfo in nsILoadInfo.idl
	 * @return reference to the new nsIChannel object
	 *
	 * Please note, if you provide both a loadingNode and a loadingPrincipal,
	 * then loadingPrincipal must be equal to loadingNode->NodePrincipal().
	 * But less error prone is to just supply a loadingNode.
	 */
	newChannelFromURIWithProxyFlags(
		uri: nsIURI,
		proxyURI: nsIURI,
		proxyFlags: number,
		loadingNode: Node,
		loadingPrincipal: any /* todo: loadingPrincipal: nsIPrincipal */,
		triggeringPrincipal: any /* todo: triggeringPrincipal: nsIPrincipal */,
		securityFlags: number,
		contentPolicyType: any /* todo: contentPolicyType: nsContentPolicyType */
	): unknown /* @todo nsIChannel */;

	/**
	 * Return true if socket process is launched.
	 */
	readonly socketProcessLaunched: boolean;

	/**
	 * The pid for socket process.
	 */
	readonly socketProcessId: number;

	/**
	 * Register a protocol handler at runtime, given protocol flags and a
	 * default port.
	 *
	 * Statically registered protocol handlers cannot be overridden, and an
	 * error will be returned if that is attempted.
	 *
	 * Runtime registered protocol handlers are never QueryInterface-ed into
	 * `nsIProtocolHandlerWithDynamicFlags`, so that interface will be ignored.
	 *
	 * @param aScheme the scheme handled by the protocol handler.
	 * @param aHandler the protocol handler instance.
	 * @param aProtocolFlags protocol flags for this protocol, see
	 *                       nsIProtocolHandler for values.
	 * @param aDefaultPort default port for this scheme, or -1.
	 */
	registerProtocolHandler(
		scheme: string,
		handler: any /* todo: handler: nsIProtocolHandler */,
		protocolFlags: number,
		defaultPort: number
	): void;

	/**
	 * Unregister a protocol handler which was previously registered using
	 * registerProtocolHandler.
	 *
	 * @param aScheme the scheme to unregister a handler for.
	 */
	unregisterProtocolHandler(scheme: string): void;
}
