/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

export interface WebExtensionPolicy {
	/**
	 * True if both e10s and webextensions.remote are enabled.  This must be
	 * used instead of checking the remote pref directly since remote extensions
	 * require both to be enabled.
	 */
	readonly useRemoteWebExtensions: boolean;

	/**
	 * True if the calling process is an extension process.
	 */
	readonly isExtensionProcess: boolean;

	/**
	 * Whether the background.service_worker in the extension manifest.json file
	 * is enabled.
	 *
	 * NOTE: **do not use Services.prefs to retrieve the value of the undelying pref**
	 *
	 * It is defined in StaticPrefs.yaml as `mirror: once` and so checking
	 * its current value using Services.prefs doesn't guarantee that it does
	 * match the value as accessible from the C++ layers, and unexpected issue
	 * may be possible if different code has a different idea of its value.
	 */
	readonly backgroundServiceWorkerEnabled: boolean;

	/**
	 * Whether the Quarantined Domains feature is enabled.  Use this as a single
	 * source of truth instead of checking extensions.QuarantinedDomains.enabled
	 * pref directly because the logic might change.
	 */
	readonly quarantinedDomainsEnabled: boolean;

	/**
	 * Returns the list of currently active extension policies.
	 */
	getActiveExtensions(): WebExtensionPolicy[];

	/**
	 * Returns the currently-active policy for the extension with the given ID,
	 * or null if no policy is active for that ID.
	 */
	getByID(id: string): WebExtensionPolicy | null;

	/**
	 * Returns the currently-active policy for the extension with the given
	 * moz-extension: hostname, or null if no policy is active for that
	 * hostname.
	 */
	getByHostname(hostname: string): WebExtensionPolicy | null;

	/**
	 * Returns the currently-active policy for the extension extension URI, or
	 * null if the URI is not an extension URI, or no policy is currently active
	 * for it.
	 */
	getByURI(uri: nsIURI): WebExtensionPolicy | null;

	/**
	 * Returns true if the URI is restricted for any extension.
	 */
	isRestrictedURI(uri: nsIURI): boolean;

	/**
	 * Returns true if the domain is on the Quarantined Domains list.
	 */
	isQuarantinedURI(uri: nsIURI): boolean;

	new (): WebExtensionPolicyInstance;
}

interface WebExtensionPolicyInstance {
	/**
	 * The add-on's internal ID, as specified in its manifest.json file or its
	 * XPI signature.
	 */

	readonly id: string;

	/**
	 * The hostname part of the extension's moz-extension: URLs. This value is
	 * generated randomly at install time.
	 */

	readonly mozExtensionHostname: string;

	/**
	 * The file: or jar: URL to use for the base of the extension's
	 * moz-extension: URL root.
	 */

	readonly baseURL: string;

	/**
	 * The extension's user-visible name.
	 */
	readonly name: string;

	/**
	 * The add-on's internal type as determined by parsing the manifest.json file.
	 */
	readonly type: string;

	/**
	 * Whether the extension has access to privileged features
	 */

	readonly isPrivileged: boolean;

	/**
	 * Whether the extension is installed temporarily
	 */
	readonly temporarilyInstalled: boolean;

	/**
	 * The manifest version in use by the extension.
	 */

	readonly manifestVersion: number;

	/**
	 * The base content security policy string to apply on extension
	 * pages for this extension.  The baseCSP is specific to the
	 * manifest version.  If the manifest version is 3 or higher it
	 * is also applied to content scripts.
	 */

	readonly baseCSP: string;

	/**
	 * The content security policy string to apply to all pages loaded from the
	 * extension's moz-extension: protocol.  If one is not provided by the
	 * extension the default value from preferences is used.
	 * See extensions.webextensions.default-content-security-policy.
	 */
	readonly extensionPageCSP: string;

	/**
	 * The list of currently-active permissions for the extension, as specified
	 * in its manifest.json file. May be updated to reflect changes in the
	 * extension's optional permissions.
	 */
	permissions: string[];

	/**
	 * Match patterns for the set of web origins to which the extension is
	 * currently allowed access. May be updated to reflect changes in the
	 * extension's optional permissions.
	 */
	allowedOrigins: any /* @todo MatchPatternSet */;

	/**
	 * The set of content scripts active for this extension.
	 */
	readonly contentScripts: any[] /* @todo WebExtensionContentScript */;

	/**
	 * True if the extension is currently active, false otherwise. When active,
	 * the extension's moz-extension: protocol will point to the given baseURI,
	 * and the set of policies for this object will be active for its ID.
	 *
	 * Only one extension policy with a given ID or hostname may be active at a
	 * time. Attempting to activate a policy while a conflicting policy is
	 * active will raise an error.
	 */
	active: boolean;

	/**
	 * True if this extension is exempt from quarantine.
	 */
	ignoreQuarantine: boolean;

	/**
	 * Set based on the manifest.incognito value:
	 * If "spanning" or "split" will be true.
	 * If "not_allowed" will be false.
	 */

	readonly privateBrowsingAllowed: boolean;

	/**
	 * Returns true if the extension can access a window.  Access is
	 * determined by matching the windows private browsing context
	 * with privateBrowsingMode.  This does not, and is not meant to
	 * handle specific differences between spanning and split mode.
	 */
	canAccessWindow(window: Window): boolean;

	/**
	 * Returns true if the extension has cross-origin access to the given URI.
	 */
	canAccessURI(uri: nsIURI, explicit?: boolean): boolean;

	/**
	 * Returns true if the extension currently has the given permission.
	 */
	hasPermission(permission: string): boolean;

	/**
	 * Returns true if this extension is quarantined from the URI.
	 */
	quarantinedFromURI(uri: nsIURI): boolean;

	/**
	 * Returns true if the given path relative to the extension's moz-extension:
	 * URL root is listed as a web accessible path. Access checks on a path, such
	 * as performed in nsScriptSecurityManager, use sourceMayAccessPath below.
	 */
	isWebAccessiblePath(pathname: string): boolean;

	/**
	 * Returns true if the given path relative to the extension's moz-extension:
	 * URL root may be accessed by web content at sourceURI.  For Manifest V2,
	 * sourceURI is ignored and the path must merely be listed as web accessible.
	 */
	sourceMayAccessPath(sourceURI: nsIURI, pathname: string): boolean;

	/**
	 * Replaces localization placeholders in the given string with localized
	 * text from the extension's currently active locale.
	 */
	localize(unlocalizedText: string): string;

	/**
	 * Returns the moz-extension: URL for the given path.
	 */
	getURL(path?: string): string;

	/**
	 * Register a new content script programmatically.
	 */
	registerContentScript(
		script: any /* @todo WebExtensionContentScript */
	): undefined;

	/**
	 * Unregister a content script.
	 */
	unregisterContentScript(
		script: any /* @todo WebExtensionContentScript */
	): undefined;

	/**
	 * Injects the extension's content script into all existing matching windows.
	 */
	injectContentScripts(): undefined;

	/**
	 * When present, the extension is not yet ready to load URLs. In that case,
	 * this policy object is a stub, and the attribute contains a promise which
	 * resolves to a new, non-stub policy object when the extension is ready.
	 *
	 * This may be used to delay operations, such as loading extension pages,
	 * which depend on extensions being fully initialized.
	 *
	 * Note: This will always be either a Promise<WebExtensionPolicy?> or null,
	 * but the WebIDL grammar does not allow us to specify a nullable Promise
	 * type.
	 *
	 * Note: This could resolve to null when the startup was interrupted.
	 */
	readonly readyPromise?: Promise<WebExtensionPolicy> | null;

	/**
	 * Returns true if the given worker script URL matches the background
	 * service worker url declared in the extension manifest.json file.
	 */
	isManifestBackgroundWorker(workerURL: string): boolean;

	/**
	 * Get the unique BrowsingContextGroup ID which will be used for toplevel
	 * page loads from this extension.
	 *
	 * This method will raise an exception if called from outside of the parent
	 * process, or if the extension is inactive.
	 */

	readonly browsingContextGroupId: number;
}
