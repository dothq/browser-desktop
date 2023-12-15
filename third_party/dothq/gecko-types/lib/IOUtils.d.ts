/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { nsIFile } from "./nsIFile";

/**
 * Options to be passed to the |IOUtils.readUTF8| method.
 */
type ReadUTF8Options = {
	/**
	 * If true, this option indicates that the file to be read is compressed with
	 * LZ4-encoding, and should be decompressed before the data is returned to
	 * the caller.
	 */
	decompress?: boolean;
};

type ReadOptions = ReadUTF8Options & {
	/**
	 * The offset into the file to read from. If unspecified, the file will be read
	 * from the start.
	 */
	offset?: number;

	/**
	 * The max bytes to read from the file at path. If unspecified, the entire
	 * file will be read. This option is incompatible with |decompress|.
	 */
	maxBytes?: number;
};

/**
 * Modes for writing to a file.
 */
export enum WriteMode {
	/**
	 * Overwrite the contents of the file.
	 *
	 * The file will be created if it does not exist.
	 */
	"overwrite",
	/**
	 * Append to the end of the file.
	 *
	 * This mode will refuse to create the file if it does not exist.
	 */
	"append",
	/**
	 * Append to the end of the file, or create it if it does not exist.
	 */
	"appendOrCreate",
	/**
	 * Create a new file.
	 *
	 * This mode will refuse to overwrite an existing file.
	 */
	"create"
}

/**
 * Options to be passed to the |IOUtils.write| and |writeUTF8|
 * methods.
 */
type WriteOptions = {
	/**
	 * If specified, backup the destination file to this path before writing.
	 */
	backupFile?: string;
	/**
	 * If specified, write the data to a file at |tmpPath| instead of directly to
	 * the destination. Once the write is complete, the destination will be
	 * overwritten by a move. Specifying this option will make the write a little
	 * slower, but also safer.
	 */
	tmpPath?: string;
	/**
	 * The mode used to write to the file.
	 */
	mode?: WriteMode;
	/**
	 * If true, force the OS to write its internal buffers to the disk.
	 * This is considerably slower for the whole system, but safer in case of
	 * an improper system shutdown (e.g. due to a kernel panic) or device
	 * disconnection before the buffers are flushed.
	 */
	flush?: boolean;
	/**
	 * If true, compress the data with LZ4-encoding before writing to the file.
	 */
	compress?: boolean;
};

/**
 * Options to be passed to the |IOUtils.move| method.
 */
type MoveOptions = {
	/**
	 * If true, fail if the destination already exists.
	 */
	noOverwrite?: boolean;
};

/**
 * Options to be passed to the |IOUtils.remove| method.
 */
type RemoveOptions = {
	/**
	 * If true, no error will be reported if the target file is missing.
	 */
	ignoreAbsent?: boolean;
	/**
	 * If true, and the target is a directory, recursively remove files.
	 */
	recursive?: boolean;

	/**
	 * If true, a failed delete on a readonly file will be retried by first
	 * removing the readonly attribute.
	 *
	 * Only has an effect on Windows.
	 */
	retryReadonly?: boolean;
};

/**
 * Options to be passed to the |IOUtils.makeDirectory| method.
 */
type MakeDirectoryOptions = {
	/**
	 * If true, create the directory and all necessary ancestors if they do not
	 * already exist. If false and any ancestor directories do not exist,
	 * |makeDirectory| will reject with an error.
	 */
	createAncestors?: boolean;
	/**
	 * If true, succeed even if the directory already exists (default behavior).
	 * Otherwise, fail if the directory already exists.
	 */
	ignoreExisting?: boolean;
	/**
	 * The file mode to create the directory with.
	 *
	 * This is ignored on Windows.
	 */
	permissions?: number;
};

/**
 * Options to be passed to the |IOUtils.copy| method.
 */
type CopyOptions = {
	/**
	 * If true, fail if the destination already exists.
	 */
	noOverwrite: boolean;
	/**
	 * If true, copy the source recursively.
	 */
	recursive: boolean;
};

/**
 * Options to be passed to the |IOUtils.getChildren| method.
 */
type GetChildrenOptions = {
	/**
	 * If true, no error will be reported if the target file is missing.
	 */
	ignoreAbsent: boolean;
};

/**
 * Types of files that are recognized by the |IOUtils.stat| method.
 */
export enum FileType {
	"regular",
	"directory",
	"other"
}

/**
 * Basic metadata about a file.
 */
type FileInfo = {
	/**
	 * The absolute path to the file on disk, as known when this file info was
	 * obtained.
	 */
	path: string;

	/**
	 * Identifies if the file at |path| is a regular file, directory, or something
	 * something else.
	 */
	type: FileType;

	/**
	 * If this represents a regular file, the size of the file in bytes.
	 * Otherwise, -1.
	 */
	size: number;

	/**
	 * The timestamp of file creation, represented in milliseconds since Epoch
	 * (1970-01-01T00:00:00.000Z).
	 *
	 * This is only available on MacOS and Windows.
	 */
	creationTime: number;

	/**
	 * The timestmp of last file accesss, represented in milliseconds since Epoch
	 * (1970-01-01T00:00:00.000Z).
	 */
	lastAccessed: number;

	/**
	 * The timestamp of the last file modification, represented in milliseconds
	 * since Epoch (1970-01-01T00:00:00.000Z).
	 */
	lastModified: number;

	/**
	 * The permissions of the file, expressed as a UNIX file mode.
	 *
	 * NB: Windows does not make a distinction between user, group, and other
	 * permissions like UNICES do. The user, group, and other parts will always
	 * be identical on Windows.
	 */
	permissions: number;
};

/**
 * The supported hash algorithms for |IOUtils.hashFile|.
 */
export enum HashAlgorithm {
	"sha1",
	"sha256",
	"sha384",
	"sha512"
}

/**
 * Windows-specific file attributes.
 */
type WindowsFileAttributes = {
	/**
	 * Whether or not the file is read-only.
	 */
	readOnly: boolean;
	/**
	 * Whether or not the file is hidden.
	 */
	hidden: boolean;
	/**
	 * Whether or not the file is classified as a system file.
	 */
	system: boolean;
};

/**
 * Options for the `launchApp` method.  See also `base::LaunchOptions`
 * in C++.
 */
type LaunchOptions = {
	/**
	 * The environment variables, as a sequence of `NAME=value` strings.
	 * (The underlying C++ code can also inherit the current environment
	 * with optional changes; that feature could be added here if needed.)
	 */
	environment: string[];

	/**
	 * The initial current working directory.
	 */
	workdir: string;

	/**
	 * File descriptors to pass to the child process.  Any fds not
	 * mentioned here, other than stdin/out/err, will not be inherited
	 * even if they aren't marked close-on-exec.
	 */
	fdMap: FdMapping[];

	/**
	 * On macOS 10.14+, disclaims responsibility for the child process
	 * with respect to privacy/security permission prompts and
	 * decisions.  Ignored if not supported by the OS.
	 */
	disclaim: boolean;
};

/**
 * Describes a file descriptor to give to the child process.
 */
type FdMapping = {
	/**
	 * The fd in the parent process to pass.  This must remain open during
	 * the call to `launchApp` but can be closed after it returns (or throws).
	 */
	src: number;

	/**
	 * The fd number to map it to in the child process.
	 */
	dst: number;
};

export interface IOUtils {
	/**
	 * Reads up to |opts.maxBytes| of the file at |path| according to |opts|.
	 *
	 * NB: The maximum file size that can be read is UINT32_MAX.
	 *
	 * @param path An absolute file path.
	 *
	 * @return Resolves with an array of unsigned byte values read from disk,
	 *         otherwise rejects with a DOMException.
	 */

	read(path: string, opts?: ReadOptions): Promise<Uint8Array>;
	/**
	 * Reads the UTF-8 text file located at |path| and returns the decoded
	 * contents as a |DOMString|. If a UTF-8 byte order marker (BOM) is
	 * present, it will be stripped from the returned string.
	 *
	 * NB: The maximum file size that can be read is UINT32_MAX.
	 *
	 * @param path An absolute file path.
	 *
	 * @return Resolves with the file contents encoded as a string, otherwise
	 *         rejects with a DOMException.
	 */

	readUTF8(path: string, opts?: ReadOptions): Promise<string>;
	/**
	 * Read the UTF-8 text file located at |path| and return the contents
	 * parsed as JSON into a JS value.
	 *
	 * NB: The maximum file size that can be read is UINT32_MAX.
	 *
	 * @param path An absolute path.
	 *
	 * @return Resolves with the contents of the file parsed as JSON.
	 */

	readJSON(path: string, opts?: ReadOptions): Promise<any>;
	/**
	 * Attempts to safely write |data| to a file at |path|.
	 *
	 * This operation can be made atomic by specifying the |tmpPath| option. If
	 * specified, then this method ensures that the destination file is not
	 * modified until the data is entirely written to the temporary file, after
	 * which point the |tmpPath| is moved to the specified |path|.
	 *
	 * The target file can also be backed up to a |backupFile| before any writes
	 * are performed to prevent data loss in case of corruption.
	 *
	 * @param path    An absolute file path.
	 * @param data    Data to write to the file at path.
	 *
	 * @return Resolves with the number of bytes successfully written to the file,
	 *         otherwise rejects with a DOMException.
	 */

	write(
		path: string,
		data: Uint8Array,
		options?: WriteOptions
	): Promise<number>;
	/**
	 * Attempts to encode |string| to UTF-8, then safely write the result to a
	 * file at |path|. Works exactly like |write|.
	 *
	 * @param path      An absolute file path.
	 * @param string    A string to write to the file at path.
	 * @param options   Options for writing the file.
	 *
	 * @return Resolves with the number of bytes successfully written to the file,
	 *         otherwise rejects with a DOMException.
	 */

	writeUTF8(
		path: string,
		string: string,
		options?: WriteOptions
	): Promise<number>;
	/**
	 * Attempts to serialize |value| into a JSON string and encode it as into a
	 * UTF-8 string, then safely write the result to a file at |path|. Works
	 * exactly like |write|.
	 *
	 * @param path      An absolute file path
	 * @param value     The value to be serialized.
	 * @param options   Options for writing the file. The "append" mode is not supported.
	 *
	 * @return Resolves with the number of bytes successfully written to the file,
	 *         otherwise rejects with a DOMException.
	 */

	writeJSON(
		path: string,
		value: any,
		options?: WriteOptions
	): Promise<number>;
	/**
	 * Moves the file from |sourcePath| to |destPath|, creating necessary parents.
	 * If |destPath| is a directory, then the source file will be moved into the
	 * destination directory.
	 *
	 * @param sourcePath An absolute file path identifying the file or directory
	 *                   to move.
	 * @param destPath   An absolute file path identifying the destination
	 *                   directory and/or file name.
	 *
	 * @return Resolves if the file is moved successfully, otherwise rejects with
	 *         a DOMException.
	 */

	move(
		sourcePath: string,
		destPath: string,
		options?: MoveOptions
	): Promise<undefined>;
	/**
	 * Removes a file or directory at |path| according to |options|.
	 *
	 * @param path An absolute file path identifying the file or directory to
	 *             remove.
	 *
	 * @return Resolves if the file is removed successfully, otherwise rejects
	 *         with a DOMException.
	 */

	remove(path: string, options?: RemoveOptions): Promise<undefined>;
	/**
	 * Creates a new directory at |path| according to |options|.
	 *
	 * @param path An absolute file path identifying the directory to create.
	 *
	 * @return Resolves if the directory is created successfully, otherwise
	 *         rejects with a DOMException.
	 */

	makeDirectory(
		path: string,
		options?: MakeDirectoryOptions
	): Promise<undefined>;
	/**
	 * Obtains information about a file, such as size, modification dates, etc.
	 *
	 * @param path An absolute file path identifying the file or directory to
	 *             inspect.
	 *
	 * @return Resolves with a |FileInfo| object for the file at path, otherwise
	 *         rejects with a DOMException.
	 *
	 * @see FileInfo
	 */

	stat(path: string): Promise<FileInfo>;
	/**
	 * Copies a file or directory from |sourcePath| to |destPath| according to
	 * |options|.
	 *
	 * @param sourcePath An absolute file path identifying the source file to be
	 *                   copied.
	 * @param destPath   An absolute file path identifying the location for the
	 *                   copy.
	 *
	 * @return Resolves if the file was copied successfully, otherwise rejects
	 *         with a DOMException.
	 */

	copy(
		sourcePath: string,
		destPath: string,
		options?: CopyOptions
	): Promise<undefined>;
	/**
	 * Updates the access time for the file at |path|.
	 *
	 * @param path         An absolute file path identifying the file whose
	 *                     modification time is to be set. This file must exist
	 *                     and will not be created.
	 * @param modification An optional access time for the file expressed in
	 *                     milliseconds since the Unix epoch
	 *                     (1970-01-01T00:00:00Z). The current system time is used
	 *                     if this parameter is not provided.
	 *
	 * @return Resolves with the updated access time time expressed in
	 *         milliseconds since the Unix epoch, otherwise rejects with a
	 *         DOMException.
	 */

	setAccessTime(path: string, access?: number): Promise<number>;
	/**
	 * Updates the modification time for the file at |path|.
	 *
	 * @param path         An absolute file path identifying the file whose
	 *                     modification time is to be set. This file must exist
	 *                     and will not be created.
	 * @param modification An optional modification time for the file expressed in
	 *                     milliseconds since the Unix epoch
	 *                     (1970-01-01T00:00:00Z). The current system time is used
	 *                     if this parameter is not provided.
	 *
	 * @return Resolves with the updated modification time expressed in
	 *         milliseconds since the Unix epoch, otherwise rejects with a
	 *         DOMException.
	 */

	setModificationTime(
		path: string,
		modification?: number
	): Promise<number>;
	/**
	 * Retrieves a (possibly empty) list of immediate children of the directory at
	 * |path|.
	 *
	 * @param path An absolute file path.
	 *
	 * @return Resolves with a sequence of absolute file paths representing the
	 *         children of the directory at |path|, otherwise rejects with a
	 *         DOMException.
	 */

	getChildren(
		path: string,
		options?: GetChildrenOptions
	): Promise<string[]>;
	/**
	 * Set the permissions of the file at |path|.
	 *
	 * Windows does not make a distinction between user, group, and other
	 * permissions like UNICES do. If a permission flag is set for any of user,
	 * group, or other has a permission, then all users will have that
	 * permission. Additionally, Windows does not support setting the
	 * "executable" permission.
	 *
	 * @param path        An absolute file path
	 * @param permissions The UNIX file mode representing the permissions.
	 * @param honorUmask  If omitted or true, any UNIX file mode value is
	 *                    modified by the process umask. If false, the exact value
	 *                    of UNIX file mode will be applied. This value has no effect
	 *                    on Windows.
	 *
	 * @return Resolves if the permissions were set successfully, otherwise
	 *         rejects with a DOMException.
	 */

	setPermissions(
		path: string,
		permissions: number,
		honorUmask?: boolean
	): Promise<undefined>;
	/**
	 * Return whether or not the file exists at the given path.
	 *
	 * @param path An absolute file path.
	 *
	 * @return A promise that resolves to whether or not the given file exists.
	 */

	exists(path: string): Promise<boolean>;

	/**
	 * Create a file with a unique name and return its path.
	 *
	 * @param parent An absolute path to the directory where the file is to be
	 *               created.
	 * @param prefix A prefix for the filename.
	 *
	 * @return A promise that resolves to a unique filename.
	 */

	createUniqueFile(
		parent: string,
		prefix: string,
		permissions?: number
	): Promise<string>;

	/**
	 * Create a directory with a unique name and return its path.
	 *
	 * @param parent An absolute path to the directory where the file is to be
	 *               created.
	 * @param prefix A prefix for the directory name.
	 *
	 * @return A promise that resolves to a unique directory name.
	 */

	createUniqueDirectory(
		parent: string,
		prefix: string,
		permissions?: number
	): Promise<string>;

	/**
	 * Compute the hash of a file as a hex digest.
	 *
	 * @param path   The absolute path of the file to hash.
	 * @param method The hashing method to use.
	 *
	 * @return A promise that resolves to the hex digest of the file's hash in lowercase.
	 */

	computeHexDigest(
		path: string,
		method: HashAlgorithm
	): Promise<string>;

	/**
	 * Return the Windows-specific file attributes of the file at the given path.
	 *
	 * @param path An absolute file path.
	 *
	 * @return A promise that resolves to the Windows-specific file attributes.
	 */

	getWindowsAttributes(
		path: string
	): Promise<WindowsFileAttributes>;

	/**
	 * Set the Windows-specific file attributes of the file at the given path.
	 *
	 * @param path An absolute file path.
	 * @param attrs The attributes to set. Attributes will only be set if they are
	 *              |true| or |false| (i.e., |undefined| attributes are not
	 *              changed).
	 *
	 * @return A promise that resolves is the attributes were set successfully.
	 */

	setWindowsAttributes(
		path: string,
		attrs?: WindowsFileAttributes
	): Promise<undefined>;

	/**
	 * Return whether or not the file has a specific extended attribute.
	 *
	 * @param path An absolute path.
	 * @param attr The attribute to check for.
	 *
	 * @return A promise that resolves to whether or not the file has an extended
	 *         attribute, or rejects with an error.
	 */

	hasMacXAttr(path: string, attr: string): Promise<boolean>;
	/**
	 * Return the value of an extended attribute for a file.
	 *
	 * @param path An absolute path.
	 * @param attr The attribute to get the value of.
	 *
	 * @return A promise that resolves to the value of the extended attribute, or
	 *         rejects with an error.
	 */

	getMacXAttr(path: string, attr: string): Promise<Uint8Array>;
	/**
	 * Set the extended attribute on a file.
	 *
	 * @param path  An absolute path.
	 * @param attr  The attribute to set.
	 * @param value The value of the attribute to set.
	 *
	 * @return A promise that resolves to whether or not the file has an extended
	 *         attribute, or rejects with an error.
	 */

	setMacXAttr(
		path: string,
		attr: string,
		value: Uint8Array
	): Promise<undefined>;
	/**
	 * Delete the extended attribute on a file.
	 *
	 * @param path An absolute path.
	 * @param attr The attribute to delete.
	 *
	 * @return A promise that resolves if the attribute was deleted, or rejects
	 *         with an error.
	 */

	delMacXAttr(path: string, attr: string): Promise<undefined>;

	/**
	 * Return a nsIFile whose parent directory exists. The parent directory of the
	 * file will be created off main thread if it does not already exist.
	 *
	 * @param components The path components. The first component must be an
	 *                   absolute path.
	 *
	 * @return A promise that resolves to an nsIFile for the requested file.
	 */

	getFile(...components: string[]): Promise<nsIFile>;

	/**
	 * Return an nsIFile corresponding to a directory. It will be created
	 * off-main-thread if it does not already exist.
	 *
	 * @param components The path components. The first component must be an
	 *                   absolute path.
	 *
	 * @return A promise that resolves to an nsIFile for the requested directory.
	 */

	getDirectory(...components: string[]): Promise<nsIFile>;
}
