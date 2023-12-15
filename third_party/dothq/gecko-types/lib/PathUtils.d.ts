/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

interface SplitRelativeOptions {
	/** Allow for a path that contains empty components. */
	allowEmpty: boolean;

	/** Allow for a path that contains ".." components. */
	allowParentDir: boolean;

	/** Allow for a path that contains "." components. */
	allowCurrentDir: boolean;
}

export interface PathUtils {
	/**
	 * The profile directory.
	 */

	readonly profileDir: string;

	/**
	 * The local-specific profile directory.
	 */

	readonly localProfileDir: string;

	/**
	 * The OS temporary directory.
	 */

	readonly tempDir: string;

	/**
	 * The libxul path.
	 */

	readonly xulLibraryPath: string;

	/**
	 * Return the last path component.
	 *
	 * @param path An absolute path.
	 *
	 * @returns The last path component.
	 */

	filename(path: string): string;

	/**
	 * Return an ancestor directory of the given path.
	 *
	 * @param path An absolute path.
	 * @param depth The number of ancestors to remove, defaulting to 1 (i.e., the
	 *              parent).
	 *
	 * @return The ancestor directory.
	 *
	 *         If the path provided is a root path (e.g., `C:` on Windows or `/`
	 *         on *NIX), then null is returned.
	 */

	parent(path: string, depth?: number): string | null;

	/**
	 * Join the given components into a full path.
	 *
	 * @param components The path components. The first component must be an
	 *                   absolute path. There must be at least one component.
	 */
	join(...components: string[]): string;

	/**
	 * Join the given relative path to the base path.
	 *
	 * @param base The base path. This must be an absolute path.
	 * @param relativePath A relative path to join to the base path.
	 */
	joinRelative(base: string, relativePath: string): string;

	/**
	 * Creates an adjusted path using a path whose length is already close
	 * to MAX_PATH. For windows only.
	 *
	 * @param path An absolute path.
	 */
	toExtendedWindowsPath(path: string);

	/**
	 * Normalize a path by removing multiple separators and `..` and `.`
	 * directories.
	 *
	 * On UNIX platforms, the path must exist as symbolic links will be resolved.
	 *
	 * @param path The absolute path to normalize.
	 *
	 */
	normalize(path: string);

	/**
	 * Split a path into its components.
	 *
	 * @param path An absolute path.
	 */
	split(path: string): string[];

	/**
	 * Split a relative path into its components.
	 *
	 * @param path A relative path.
	 */
	splitRelative(
		path: string,
		options?: SplitRelativeOptions
	): string[];

	/**
	 * Transform a file path into a file: URI
	 *
	 * @param path An absolute path.
	 *
	 * @return The file: URI as a string.
	 */
	toFileURI(path: string): string;

	/**
	 * Determine if the given path is an absolute or relative path.
	 *
	 * @param path A file path that is either relative or absolute.
	 *
	 * @return Whether or not the path is absolute.
	 */
	isAbsolute(path: string): boolean;
}
