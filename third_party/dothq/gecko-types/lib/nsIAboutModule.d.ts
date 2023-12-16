/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { nsIChannel } from ".";

export interface nsIAboutModule extends nsIChannel {
	/**
	 * Constructs a new channel for the about protocol module.
	 *
	 * @param aURI the uri of the new channel
	 * @param aLoadInfo the loadinfo of the new channel
	 */
	newChannel(uri: nsIURI, loadInfo: any /* @todo nsILoadInfo */): nsIChannel;

	/**
	 * A flag that indicates whether a URI should be run with content
	 * privileges. If it is, the about: protocol handler will enforce that
	 * the principal of channels created for it be based on their
	 * originalURI or URI (depending on the channel flags), by setting
	 * their "owner" to null.
	 * If content needs to be able to link to this URI, specify
	 * URI_CONTENT_LINKABLE as well.
	 */
	URI_SAFE_FOR_UNTRUSTED_CONTENT: number;

	/**
	 * A flag that indicates whether script should be enabled for the
	 * given about: URI even if it's disabled in general.
	 */
	ALLOW_SCRIPT: number;

	/**
	 * A flag that indicates whether this about: URI doesn't want to be listed
	 * in about:about, especially if it's not useful without a query string.
	 */
	HIDE_FROM_ABOUTABOUT: number;

	/**
	 * A flag that indicates whether this about: URI wants Indexed DB enabled.
	 */
	ENABLE_INDEXED_DB: number;

	/**
	 * A flag that indicates that this URI can be loaded in a child process
	 */
	URI_CAN_LOAD_IN_CHILD: number;

	/**
	 * A flag that indicates that this URI must be loaded in a child process
	 */
	URI_MUST_LOAD_IN_CHILD: number;

	/**
	 * Obsolete. This flag no longer has any effect and will be removed in future.
	 */
	MAKE_UNLINKABLE: number;

	/**
	 * A flag that indicates that this URI should be linkable from content.
	 * Ignored unless URI_SAFE_FOR_UNTRUSTED_CONTENT is also specified.
	 *
	 * When adding a new about module with this flag make sure to also update
	 * IsSafeToLinkForUntrustedContent() in nsAboutProtocolHandler.cpp
	 */
	MAKE_LINKABLE: number;

	/**
	 * A flag that indicates that this URI can be loaded in the privileged
	 * activity stream content process if said process is enabled. Ignored unless
	 * URI_MUST_LOAD_IN_CHILD is also specified.
	 */
	URI_CAN_LOAD_IN_PRIVILEGEDABOUT_PROCESS: number;

	/**
	 * A flag that indicates that this URI must be loaded in an extension process (if available).
	 */
	URI_MUST_LOAD_IN_EXTENSION_PROCESS: number;

	/**
	 * A flag that indicates that this about: URI needs to allow unsanitized content.
	 * Only to be used by about:home and about:newtab.
	 */
	ALLOW_UNSANITIZED_CONTENT: number;

	/**
	 * A flag that indicates that this about: URI is a secure chrome UI
	 */
	IS_SECURE_CHROME_UI: number;

	/**
	 * A method to get the flags that apply to a given about: URI.  The URI
	 * passed in is guaranteed to be one of the URIs that this module
	 * registered to deal with.
	 */
	getURIFlags(uri: nsIURI): number;

	/**
	 * A method to get the chrome URI that corresponds to a given about URI.
	 */
	getChromeURI(uri: nsIURI): nsIURI;
}
