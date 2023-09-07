/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

export interface nsISearchSubmission {
	/**
	 * The POST data associated with a search submission, wrapped in a MIME
	 * input stream. May be null.
	 */
	readonly postData: unknown /* todo: postData: nsIInputStream */;

	/**
	 * The URI to submit a search to.
	 */
	readonly uri: nsIURI;
}

export interface nsISearchEngine {
	/**
	 * Gets a nsISearchSubmission object that contains information about what to
	 * send to the search engine, including the URI and postData, if applicable.
	 *
	 * @param searchTerms
	 *   The search term(s) for the submission.
	 *
	 * @param responseType [optional]
	 *   The MIME type that we'd like to receive in response
	 *   to this submission.  If null, will default to "text/html".
	 *
	 * @param purpose [optional]
	 *   A string that indicates the context of the search request. This may then
	 *   be used to provide different submission data depending on the context.
	 *
	 * @returns nsISearchSubmission
	 *   The submission data. If no appropriate submission can be determined for
	 *   the request type, this may be null.
	 */
	getSubmission(
		searchTerms: string,
		responseType?: string,
		purpose?: string
	): nsISearchSubmission;
	/**
	 * Returns the search term of a possible search result URI if and only if:
	 * - The URI has the same scheme, host, and path as the engine.
	 * - All query parameters of the URI have a matching name and value in the engine.
	 * - An exception to the equality check is the engine's termsParameterName
	 *   value, which contains a placeholder, i.e. {searchTerms}.
	 * - If an engine has query parameters with "null" values, they will be ignored.
	 *
	 * @param  uri
	 *         A URI that may or may not be from a search result matching the engine.
	 *
	 * @returns A string representing the termsParameterName value of the URI,
	 *          or an empty string if the URI isn't matched to the engine.
	 */
	searchTermFromResult(uri: nsIURI): string;

	/**
	 * Returns the name of the parameter used for the search terms for a submission
	 * URL of type `SearchUtils.URL_TYPE.SEARCH`.
	 *
	 * @returns A string which is the name of the parameter, or empty string
	 *          if no parameter cannot be found or is not supported (e.g. POST).
	 */
	readonly searchUrlQueryParamName: string;

	/**
	 * Returns the public suffix for the submission URL of type
	 * `SearchUtils.URL_TYPE.SEARCH`.
	 *
	 * @returns A string which is a known public suffix, or empty string
	 *          if one cannot be found.
	 */
	readonly searchUrlPublicSuffix: string;

	/**
	 * Determines whether the engine can return responses in the given
	 * MIME type.  Returns true if the engine spec has a URL with the
	 * given responseType, false otherwise.
	 *
	 * @param responseType
	 *        The MIME type to check for
	 */
	supportsResponseType(responseType: string): boolean;

	/**
	 * Returns a string with the URL to an engine's icon matching both width and
	 * height. Returns null if icon with specified dimensions is not found.
	 *
	 * @param width
	 *        Width of the requested icon.
	 * @param height
	 *        Height of the requested icon.
	 */
	getIconURLBySize(width: number, height: number): string;

	/**
	 * Gets an array of all available icons. Each entry is an object with
	 * width, height and url properties. width and height are numeric and
	 * represent the icon's dimensions. url is a string with the URL for
	 * the icon.
	 */
	getIcons(): { width: number; height: number; url: string }[];

	/**
	 * Opens a speculative connection to the engine's search URI
	 * (and suggest URI, if different) to reduce request latency
	 *
	 * @param  options
	 *         An object that must contain the following fields:
	 *         {window} the content window for the window performing the search
	 *         {originAttributes} the originAttributes for performing the search
	 *
	 * @throws NS_ERROR_INVALID_ARG if options is omitted or lacks required
	 *         elemeents
	 */
	speculativeConnect(options: {
		window: Window;
		originAttributes: object;
	}): void;

	/**
	 * An optional shortcut alias for the engine.
	 * When not an empty string, this is a unique identifier.
	 */
	alias: string;

	/**
	 * An array of aliases including the user defined alias and
	 * ones specified by the webextensions keywords field.
	 */
	readonly aliases: string[];

	/**
	 * A text description describing the engine.
	 */
	readonly description: string;

	/**
	 * Whether the engine should be hidden from the user.
	 */
	hidden: boolean;

	/**
	 * Whether the associated one off button should be hidden from the user.
	 */
	hideOneOffButton: boolean;

	/**
	 * A nsIURI corresponding to the engine's icon, stored locally. May be null.
	 */
	readonly iconURI: nsIURI;

	/**
	 * The display name of the search engine. This is a unique identifier.
	 */
	readonly name: string;

	/**
	 * The display of the search engine id. This is a unique identifier.
	 */
	readonly id: string;

	/**
	 * The searchForm URL points to the engine's organic search page. This should
	 * not contain neither search term parameters nor partner codes, but may
	 * contain parameters which set the engine in the correct way.
	 *
	 * This URL is typically the prePath and filePath of the search submission URI,
	 * but may vary for different engines. For example, some engines may use a
	 * different domain, e.g. https://sub.example.com for the search URI but
	 * https://example.org/ for the organic search page.
	 */
	readonly searchForm: string;

	/**
	 * A boolean to indicate if we should send an attribution request to Mozilla's
	 * server.
	 */
	readonly sendAttributionRequest: boolean;

	/**
	 * The identifier to use for this engine when submitting to telemetry.
	 */
	readonly telemetryId: string;

	/**
	 * An optional unique identifier for this search engine within the context of
	 * the distribution, as provided by the distributing entity.
	 */
	readonly identifier: string;

	/**
	 * Whether or not this engine is provided by the application, e.g. it is
	 * in the list of configured search engines.
	 */
	readonly isAppProvided: boolean;

	/**
	 * Whether or not this engine is an in-memory only search engine.
	 * These engines are typically application provided or policy engines,
	 * where they are loaded every time on SearchService initialization
	 * using the policy JSON or the extension manifest. Minimal details of the
	 * in-memory engines are saved to disk, but they are never loaded
	 * from the user's saved settings file.
	 */
	readonly inMemory: boolean;

	/**
	 * Whether or not this engine is a "general" search engine, e.g. is it for
	 * generally searching the web, or does it have a specific purpose like
	 * shopping.
	 */
	readonly isGeneralPurposeEngine: boolean;

	/**
	 * The domain from which search results are returned for this engine.
	 *
	 * @return the domain of the the search URL.
	 */
	readonly searchUrlDomain: string;
}
