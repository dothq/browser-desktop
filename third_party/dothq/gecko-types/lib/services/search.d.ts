/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/. */

import { nsISearchEngine } from "../nsISearchEngine";

interface OpenSearchEngine {
	iconURL?: string;
	description?: string;
	name: string;
	encoding?: string;
	search_url: string;
	keyword?: string;
	search_url_post_params?: string;
	suggest_url: string;
}

export interface ServicesSearch {
	ERROR_DOWNLOAD_FAILURE: number;
	ERROR_DUPLICATE_ENGINE: number;
	ERROR_ENGINE_CORRUPTED: number;

	/**
	 * Start asynchronous initialization.
	 *
	 * The promise is resolved once initialization is complete, which may be
	 * immediately, if initialization has already been completed by some previous
	 * call to this method.
	 * This method should only be called when you need or want to wait for the
	 * full initialization of the search service.
	 */
	init(): Promise<any>;

	/**
	 * Determine whether initialization has been completed.
	 *
	 * Clients of the service can use this attribute to quickly determine whether
	 * initialization is complete, and decide to trigger some immediate treatment,
	 * to launch asynchronous initialization or to bailout.
	 *
	 * Note that this attribute does not indicate that initialization has succeeded.
	 *
	 * @return |true| if the search service is now initialized, |false| if
	 * initialization has not been triggered yet.
	 */
	readonly isInitialized: boolean;

	/**
	 * Runs background checks; Designed to be run on idle.
	 */
	runBackgroundChecks(): Promise<any>;

	/**
	 * Resets the default engine to its app default engine value.
	 */
	resetToAppDefaultEngine(): Promise<nsISearchEngine>;

	/**
	 * Adds a new Open Search engine from the file at the supplied URI.
	 *
	 * @param engineURL
	 *        The URL to the search engine's description file.
	 *
	 * @param iconURL
	 *        A URL string to an icon file to be used as the search engine's
	 *        icon. This value may be overridden by an icon specified in the
	 *        engine description file.
	 *
	 * @throws NS_ERROR_FAILURE if the description file cannot be successfully
	 *         loaded.
	 */
	addOpenSearchEngine(
		engineURL: string,
		iconURL: string
	): Promise<nsISearchEngine>;

	/**
	 * Adds a new search engine for enterprises.
	 *
	 * @param details
	 *        An object with the following details:
	 *
	 *        {iconURL} Optional. The icon to use for the engine.
	 *        {description} Optional. The description of the engine.
	 *        {name} The name of the engine
	 *        {encoding} Optional. The encoding of the engine.
	 *        {search_url} The search url for the engine.
	 *        {keyword} Optional. The keyword for the engine.
	 *        {search_url_post_params} Optional. Post parameters for the search
	 *          engine submission.
	 *        {suggest_url} The suggestion url for the engine.
	 */
	addPolicyEngine(
		details: OpenSearchEngine
	): Promise<nsISearchEngine>;

	/**
	 * Updates an existing engine for enterprises.
	 *
	 * @param details
	 *        An object with the following details:
	 *
	 *        {iconURL} Optional. The icon to use for the engine.
	 *        {description} Optional. The description of the engine.
	 *        {name} The name of the engine
	 *        {encoding} Optional. The encoding of the engine.
	 *        {search_url} The search url for the engine.
	 *        {keyword} Optional. The keyword for the engine.
	 *        {search_url_post_params} Optional. Post parameters for the search
	 *          engine submission.
	 *        {suggest_url} The suggestion url for the engine.
	 */
	updatePolicyEngine(
		details: OpenSearchEngine
	): Promise<nsISearchEngine>;

	/**
	 * Adds a new search engine defined by the user.
	 *
	 * @param name
	 *        The name of the engine.
	 * @param url
	 *        The url of the engine with %s denoting where to
	 *        replace the search term.
	 * @param alias [optional]
	 *        The alias to refer to the engine.
	 */
	addUserEngine(
		name: string,
		url: string,
		alias?: string
	): Promise<nsISearchEngine>;

	/**
	 * Adds search providers to the search service.  If the search
	 * service is configured to load multiple locales for the extension,
	 * it may load more than one search engine. If called directly
	 * ensure the extension has been initialised.
	 *
	 * @param extension
	 *        The extension to load from.
	 * @returns Promise that resolves when finished.
	 */
	addEnginesFromExtension(extension: any): Promise<nsISearchEngine>;

	/**
	 * Un-hides all engines in the set of engines returned by getAppProvidedEngines.
	 */
	restoreDefaultEngines(): void;

	/**
	 * Returns an engine with the specified alias.
	 *
	 * @param   alias
	 *          The search engine's alias.
	 * @returns The corresponding nsISearchEngine object, or null if it doesn't
	 *          exist.
	 */
	getEngineByAlias(alias: string): Promise<nsISearchEngine | null>;

	/**
	 * Returns an engine with the specified name.
	 *
	 * @param   aEngineName
	 *          The name of the engine.
	 * @returns The corresponding nsISearchEngine object, or null if it doesn't
	 *          exist.
	 */
	getEngineByName(aEngineName: string): nsISearchEngine;

	/**
	 * Returns an engine with the specified Id.
	 *
	 * @param   aEngineId
	 *          The Id of the engine.
	 * @returns The corresponding nsISearchEngine object, or null if it doesn't
	 *          exist.
	 */
	getEngineById(aEngineId: string): nsISearchEngine;

	/**
	 * Returns an array of all installed search engines.
	 * The array is sorted either to the user requirements or the default order.
	 *
	 * @returns an array of nsISearchEngine objects.
	 */
	getEngines(): Promise<nsISearchEngine[]>;

	/**
	 * Returns an array of all installed search engines whose hidden attribute is
	 * false.
	 * The array is sorted either to the user requirements or the default order.
	 *
	 * @returns an array of nsISearchEngine objects.
	 */
	getVisibleEngines(): Promise<nsISearchEngine[]>;

	/**
	 * Returns an array of all default search engines. This includes all loaded
	 * engines that aren't in the user's profile directory.
	 * The array is sorted to the default order.
	 *
	 * @returns an array of nsISearchEngine objects.
	 */
	getAppProvidedEngines(): Promise<nsISearchEngine[]>;

	/**
	 * Returns an array of search engines installed by a given extension.
	 *
	 * @returns an array of nsISearchEngine objects.
	 */
	getEnginesByExtensionID(
		extensionID: string
	): Promise<nsISearchEngine[]>;

	/**
	 * Moves a visible search engine.
	 *
	 * @param  engine
	 *         The engine to move.
	 * @param  newIndex
	 *         The engine's new index in the set of visible engines.
	 *
	 * @throws NS_ERROR_FAILURE if newIndex is out of bounds, or if engine is
	 *         hidden.
	 */
	moveEngine(
		engine: any,
		newIndex: number
	): Promise<nsISearchEngine>;

	/**
	 * Removes the search engine. If the search engine is installed in a global
	 * location, this will just hide the engine. If the engine is in the user's
	 * profile directory, it will be removed from disk.
	 *
	 * @param  engine
	 *         The engine to remove.
	 */
	removeEngine(engine: any): Promise<nsISearchEngine>;

	/**
	 * Notify nsSearchService that an extension has been removed. Removes any
	 * engines that are associated with that extension.
	 *
	 * @param  id
	 *         The id of the extension.
	 */
	removeWebExtensionEngine(id: string): Promise<nsISearchEngine>;

	/**
	 * The Application Default Engine object that is the default for this region,
	 * ignoring changes the user may have subsequently made.
	 */
	readonly appDefaultEngine: nsISearchEngine;

	/**
	 * The Application Default Engine object that is the default for this region when in
	 * private browsing mode, ignoring changes the user may have subsequently made.
	 */
	readonly appPrivateDefaultEngine: nsISearchEngine;

	/**
	 * The currently active search engine.
	 * Unless the application doesn't ship any search plugin, this should never
	 * be null. If the currently active engine is removed, this attribute will
	 * fallback first to the application default engine if it's not hidden, then to
	 * the first visible engine, and as a last resort it will unhide the app
	 * default engine.
	 */
	defaultEngine: nsISearchEngine;

	getDefault(): Promise<nsISearchEngine>;
	setDefault(engine: any): Promise<nsISearchEngine>;

	/**
	 * The currently active search engine for private browsing mode.
	 * @see defaultEngine.
	 */
	defaultPrivateEngine: nsISearchEngine;

	getDefaultPrivate(): Promise<nsISearchEngine>;
	setDefaultPrivate(engine: any): Promise<nsISearchEngine>;

	/**
	 * Allows the add-on manager to discover if a WebExtension based search engine
	 * may change the default to an application provided search engine.
	 * If that WebExtension is on the allow list, then it will override the
	 * built-in engine's urls and parameters.
	 *
	 *  @param extension
	 *        The extension to load from.
	 *  @returns An object with two booleans:
	 *        - canChangeToAppProvided: indicates if the WebExtension engine may
	 *            set the named engine as default e.g. it is application provided.
	 *        - canInstallEngine: indicates if the WebExtension engine may be
	 *            installed, e.g. it is not an app-provided engine.
	 */
	maybeSetAndOverrideDefault(
		extension: any
	): Promise<nsISearchEngine>;

	/**
	 * Gets a representation of the default engine in an anonymized JSON
	 * string suitable for recording in the Telemetry environment.
	 *
	 * @return {object} result
	 *   contains anonymized info about the default engine(s).
	 * @return {string} result.defaultSearchEngine
	 *   contains the telemetry id of the default engine.
	 * @return {object} result.defaultSearchEngineData
	 *   contains information about the default engine:
	 *     name, loadPath, original submissionURL
	 * @return {string} [result.defaultPrivateSearchEngine]
	 *   only returned if the preference for having a separate engine in private
	 *   mode is turned on.
	 *   contains the telemetry id of the default engine for private browsing mode.
	 * @return {object} [result.defaultPrivateSearchEngineData]
	 *   only returned if the preference for having a separate engine in private
	 *   mode is turned on.
	 *   contains information about the default engine for private browsing mode:
	 *     name, loadPath, original submissionURL
	 */
	getDefaultEngineInfo(): any;

	/**
	 * Determines if the provided URL represents results from a search engine, and
	 * provides details about the match.
	 *
	 * The lookup mechanism checks whether the domain name and path of the
	 * provided HTTP or HTTPS URL matches one of the known values for the visible
	 * search engines.  The match does not depend on which of the schemes is used.
	 * The expected URI parameter for the search terms must exist in the query
	 * string, but other parameters are ignored.
	 *
	 * @param url
	 *        String containing the URL to parse, for example
	 *        "https://www.google.com/search?q=terms".
	 */
	parseSubmissionURL(url: string): any;
}
