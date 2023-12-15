/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { nsIDirectoryEnumerator } from "./nsIDirectoryEnumerator";

export interface nsIFile {
	/**
	 *  Create Types
	 *
	 *  NORMAL_FILE_TYPE - A normal file.
	 *  DIRECTORY_TYPE   - A directory/folder.
	 */
	NORMAL_FILE_TYPE: 0;
	DIRECTORY_TYPE: 1;

	/**
	 *  append[Native]
	 *
	 *  This function is used for constructing a descendent of the
	 *  current nsIFile.
	 *
	 *   @param node
	 *       A string which is intended to be a child node of the nsIFile.
	 *       For security reasons, this cannot contain .. and cannot start with
	 *       a directory separator. For the |appendNative| method, the node must
	 *       be in the native filesystem charset.
	 */
	append(node: string): void;

	/**
	 *  Normalize the pathName (e.g. removing .. and . components on Unix).
	 */
	normalize(): void;

	/**
	 *  create
	 *
	 *  This function will create a new file or directory in the
	 *  file system. Any nodes that have not been created or
	 *  resolved, will be.  If the file or directory already
	 *  exists create() will return NS_ERROR_FILE_ALREADY_EXISTS.
	 *
	 *   @param type
	 *       This specifies the type of file system object
	 *       to be made.  The only two types at this time
	 *       are file and directory which are defined above.
	 *       If the type is unrecongnized, we will return an
	 *       error (NS_ERROR_FILE_UNKNOWN_TYPE).
	 *
	 *   @param permissions
	 *       The unix style octal permissions.  This may
	 *       be ignored on systems that do not need to do
	 *       permissions.
	 *
	 *   @param skipAncestors
	 *       Optional; if set to true, we'll skip creating
	 *       ancestor directories (and return an error instead).
	 */
	create(
		type: number,
		permissions: number,
		skipAncestors?: boolean
	): void;

	/**
	 *  Accessor to the leaf name of the file itself.
	 *  For the |nativeLeafName| method, the nativeLeafName must
	 *  be in the native filesystem charset.
	 */
	leafName: string;

	/**
	 * The leaf name as displayed in OS-provided file pickers and similar UI.
	 * On Windows and macOS, 'real' leaf names of some directories can be
	 * in English, but the OS will show a different, translated name to users
	 * using a different locale. So folders like "Downloads", "Desktop" and
	 * "Documents" might not normally appear to users with that (English) name,
	 * but with an OS-localized translation. This API will return such a
	 * translation if it exists, or the leafName if it doesn't.
	 * On Linux, this will always be the same as `leafName`.
	 */
	readonly displayName: string;

	/**
	 *  copyTo[Native]
	 *
	 *  This will copy this file to the specified newParentDir.
	 *  If a newName is specified, the file will be renamed.
	 *  If 'this' is not created we will return an error
	 *  (NS_ERROR_FILE_NOT_FOUND).
	 *
	 *  copyTo may fail if the file already exists in the destination
	 *  directory.
	 *
	 *  copyTo will NOT resolve aliases/shortcuts during the copy.
	 *
	 *   @param newParentDir
	 *       This param is the destination directory. If the
	 *       newParentDir is null, copyTo() will use the parent
	 *       directory of this file. If the newParentDir is not
	 *       empty and is not a directory, an error will be
	 *       returned (NS_ERROR_FILE_DESTINATION_NOT_DIR). For the
	 *       |CopyToNative| method, the newName must be in the
	 *       native filesystem charset.
	 *
	 *   @param newName
	 *       This param allows you to specify a new name for
	 *       the file to be copied. This param may be empty, in
	 *       which case the current leaf name will be used.
	 */
	copyTo(newParentDir: nsIFile, newName: string): void;

	/**
	 *  copyToFollowingLinks[Native]
	 *
	 *  This function is identical to copyTo with the exception that,
	 *  as the name implies, it follows symbolic links.  The XP_UNIX
	 *  implementation always follow symbolic links when copying.  For
	 *  the |CopyToFollowingLinks| method, the newName must be in the
	 *  native filesystem charset.
	 */
	copyToFollowingLinks(
		newParentDir: nsIFile,
		newName: string
	): void;

	/**
	 *  moveTo[Native]
	 *
	 *  A method to move this file or directory to newParentDir.
	 *  If a newName is specified, the file or directory will be renamed.
	 *  If 'this' is not created we will return an error
	 *  (NS_ERROR_FILE_NOT_FOUND).
	 *  If 'this' is a file, and the destination file already exists, moveTo
	 *  will replace the old file.
	 *  This object is updated to refer to the new file.
	 *
	 *  moveTo will NOT resolve aliases/shortcuts during the copy.
	 *  moveTo will do the right thing and allow copies across volumes.
	 *  moveTo will return an error (NS_ERROR_FILE_DIR_NOT_EMPTY) if 'this' is
	 *  a directory and the destination directory is not empty.
	 *  moveTo will return an error (NS_ERROR_FILE_ACCESS_DENIED) if 'this' is
	 *  a directory and the destination directory is not writable.
	 *
	 *   @param newParentDir
	 *       This param is the destination directory. If the
	 *       newParentDir is empty, moveTo() will rename the file
	 *       within its current directory. If the newParentDir is
	 *       not empty and does not name a directory, an error will
	 *       be returned (NS_ERROR_FILE_DESTINATION_NOT_DIR).  For
	 *       the |moveToNative| method, the newName must be in the
	 *       native filesystem charset.
	 *
	 *   @param newName
	 *       This param allows you to specify a new name for
	 *       the file to be moved. This param may be empty, in
	 *       which case the current leaf name will be used.
	 */
	moveTo(newParentDir: nsIFile, newName: string): void;

	/**
	 *  moveToFollowingLinks[Native]
	 *
	 *  This function is identical to moveTo with the exception that,
	 *  as the name implies, it follows symbolic links.  The XP_UNIX
	 *  implementation always follows symbolic links when moving.  For
	 *  the |MoveToFollowingLinks| method, the newName ust be in the native
	 *  filesystem charset.
	 */
	moveToFollowingLinks(
		newParentDir: nsIFile,
		newName: string
	): void;

	/**
	 *  renameTo
	 *
	 *  This method is identical to moveTo except that if this file or directory
	 *  is moved to a a different volume, it fails and returns an error
	 *  (NS_ERROR_FILE_ACCESS_DENIED).
	 *  This object will still point to the old location after renaming.
	 */
	renameTo(newParentDir: nsIFile, newName: string): void;

	/**
	 *  This will try to delete this file.  The 'recursive' flag
	 *  must be PR_TRUE to delete directories which are not empty.
	 *
	 *  If passed, 'removeCount' will be incremented by the total number of files
	 *  and/or directories removed. Will be 1 unless the 'recursive' flag is
	 *  set. The parameter must be initialized beforehand.
	 *
	 *  This will not resolve any symlinks.
	 */
	remove(recursive: boolean, removeCount?: number): void;

	/**
	 *  Attributes of nsIFile.
	 */

	permissions: number;
	permissionsOfLink: number;

	/**
	 * The last accesss time of the file in milliseconds from midnight, January
	 * 1, 1970 GMT, if available.
	 */
	lastAccessedTime: number;
	lastAccessedTimeOfLink: number;

	/**
	 *  File Times are to be in milliseconds from
	 *  midnight (00:00:00), January 1, 1970 Greenwich Mean
	 *  Time (GMT).
	 */
	lastModifiedTime: number;
	lastModifiedTimeOfLink: number;

	/**
	 * The creation time of file in milliseconds from midnight, January 1, 1970
	 * GMT, if available.
	 *
	 * This attribute is only implemented on Windows and macOS. Accessing this
	 * on another platform will this will throw NS_ERROR_NOT_IMPLEMENTED.
	 */
	readonly creationTime: number;
	readonly creationTimeOfLink: number;

	/**
	 *  WARNING!  On the Mac, getting/setting the file size with nsIFile
	 *  only deals with the size of the data fork.  If you need to
	 *  know the size of the combined data and resource forks use the
	 *  GetFileSizeWithResFork() method defined on nsILocalFileMac.
	 */
	fileSize: number;
	readonly fileSizeOfLink: number;

	/**
	 *  target & path
	 *
	 *  Accessor to the string path.  The native version of these
	 *  strings are not guaranteed to be a usable path to pass to
	 *  NSPR or the C stdlib.  There are problems that affect
	 *  platforms on which a path does not fully specify a file
	 *  because two volumes can have the same name (e.g., mac).
	 *  This is solved by holding "private", native data in the
	 *  nsIFile implementation.  This native data is lost when
	 *  you convert to a string.
	 *
	 *      DO NOT PASS TO USE WITH NSPR OR STDLIB!
	 *
	 *  target
	 *      Find out what the symlink points at.  Will give error
	 *      (NS_ERROR_FILE_INVALID_PATH) if not a symlink.
	 *
	 *  path
	 *      Find out what the nsIFile points at.
	 *
	 *  Note that the ACString attributes are returned in the
	 *  native filesystem charset.
	 *
	 */
	readonly target: string;

	readonly path: string;

	exists(): boolean;
	isWritable(): boolean;
	isReadable(): boolean;
	isExecutable(): boolean;
	isHidden(): boolean;
	isDirectory(): boolean;
	isFile(): boolean;
	isSymlink(): boolean;
	/**
	 * Not a regular file, not a directory, not a symlink.
	 */
	isSpecial(): boolean;

	/**
	 *  createUnique
	 *
	 *  This function will create a new file or directory in the
	 *  file system. Any nodes that have not been created or
	 *  resolved, will be.  If this file already exists, we try
	 *  variations on the leaf name "suggestedName" until we find
	 *  one that did not already exist.
	 *
	 *  If the search for nonexistent files takes too long
	 *  (thousands of the variants already exist), we give up and
	 *  return NS_ERROR_FILE_TOO_BIG.
	 *
	 *   @param type
	 *       This specifies the type of file system object
	 *       to be made.  The only two types at this time
	 *       are file and directory which are defined above.
	 *       If the type is unrecongnized, we will return an
	 *       error (NS_ERROR_FILE_UNKNOWN_TYPE).
	 *
	 *   @param permissions
	 *       The unix style octal permissions.  This may
	 *       be ignored on systems that do not need to do
	 *       permissions.
	 */

	createUnique(type: number, permissions: number): void;

	/**
	 * clone()
	 *
	 * This function will allocate and initialize a nsIFile object to the
	 * exact location of the |this| nsIFile.
	 *
	 *   @param file
	 *          A nsIFile which this object will be initialize
	 *          with.
	 *
	 */
	clone(): nsIFile;

	/**
	 *  Will determine if the inFile equals this.
	 */
	equals(inFile: nsIFile);

	/**
	 *  Will determine if inFile is a descendant of this file.
	 *  This routine looks in subdirectories too.
	 */
	contains(inFile: nsIFile);

	/**
	 *  Parent will be null when this is at the top of the volume.
	 */
	readonly parent: nsIFile;

	/**
	 *  Returns an enumeration of the elements in a directory. Each
	 *  element in the enumeration is an nsIFile.
	 *
	 *   @throws NS_ERROR_FILE_NOT_DIRECTORY if the current nsIFile does
	 *           not specify a directory.
	 */
	readonly directoryEntries: nsIDirectoryEnumerator;

	/**
	 *  initWith[Native]Path
	 *
	 *  This function will initialize the nsIFile object.  Any
	 *  internal state information will be reset.
	 *
	 *   @param filePath
	 *       A string which specifies a full file path to a
	 *       location.  Relative paths will be treated as an
	 *       error (NS_ERROR_FILE_UNRECOGNIZED_PATH).  For
	 *       initWithNativePath, the filePath must be in the native
	 *       filesystem charset.
	 */
	initWithPath(filePath: string): void;

	/**
	 *  initWithFile
	 *
	 *  Initialize this object with another file
	 *
	 *   @param aFile
	 *       the file this becomes equivalent to
	 */
	initWithFile(file: nsIFile): void;

	/**
	 * Flag for openNSPRFileDesc(), to hint to the OS that the file will be
	 * read sequentially with agressive readahead.
	 */
	OS_READAHEAD: 0x40000000;

	/**
	 * Flag for openNSPRFileDesc(). Deprecated and unreliable!
	 * Instead use NS_OpenAnonymousTemporaryFile() to create a temporary
	 * file which will be deleted upon close!
	 */
	DELETE_ON_CLOSE: 0x80000000;

	// number of bytes available on disk to non-superuser
	readonly diskSpaceAvailable: number;

	// disk capacity in bytes
	readonly diskCapacity: number;

	/**
	 *  appendRelative[Native]Path
	 *
	 *  Append a relative path to the current path of the nsIFile object.
	 *
	 *   @param relativeFilePath
	 *       relativeFilePath is a native relative path. For security reasons,
	 *       this cannot contain .. and cannot start with a directory separator.
	 *       For the |appendRelativeNativePath| method, the relativeFilePath
	 *       must be in the native filesystem charset.
	 */
	appendRelativePath(relativeFilePath: string): void;

	/**
	 *  Accessor to a null terminated string which will specify
	 *  the file in a persistent manner for disk storage.
	 *
	 *  The character set of this attribute is undefined.  DO NOT TRY TO
	 *  INTERPRET IT AS HUMAN READABLE TEXT!
	 */
	persistentDescriptor: string;

	/**
	 *  reveal
	 *
	 *  Ask the operating system to open the folder which contains
	 *  this file or folder. This routine only works on platforms which
	 *  support the ability to open a folder and is run async on Windows.
	 *  This routine must be called on the main.
	 */
	reveal(): void;

	/**
	 *  launch
	 *
	 *  Ask the operating system to attempt to open the file.
	 *  this really just simulates "double clicking" the file on your platform.
	 *  This routine only works on platforms which support this functionality
	 *  and is run async on Windows.  This routine must be called on the
	 *  main thread.
	 */
	launch(): void;

	/**
	 *  getRelativeDescriptor
	 *
	 *  Returns a relative file path in an opaque, XP format. It is therefore
	 *  not a native path.
	 *
	 *  The character set of the string returned from this function is
	 *  undefined.  DO NOT TRY TO INTERPRET IT AS HUMAN READABLE TEXT!
	 *
	 *   @param fromFile
	 *       the file from which the descriptor is relative.
	 *       Throws if fromFile is null.
	 */
	getRelativeDescriptor(fromFile: nsIFile): string;

	/**
	 *  setRelativeDescriptor
	 *
	 *  Initializes the file to the location relative to fromFile using
	 *  a string returned by getRelativeDescriptor.
	 *
	 *   @param fromFile
	 *       the file to which the descriptor is relative
	 *   @param relative
	 *       the relative descriptor obtained from getRelativeDescriptor
	 */
	setRelativeDescriptor(
		fromFile: nsIFile,
		relativeDesc: string
	): void;

	/**
	 *  getRelativePath
	 *
	 *  Returns a relative file from 'fromFile' to this file as a UTF-8 string.
	 *  Going up the directory tree is represented via "../".  '/' is used as
	 *  the path segment separator.  This is not a native path, since it's UTF-8
	 *  encoded.
	 *
	 *   @param fromFile
	 *       the file from which the path is relative.
	 *       Throws if fromFile is null.
	 */
	getRelativePath(fromFile: nsIFile): string;

	/**
	 *  setRelativePath
	 *
	 *  Initializes the file to the location relative to fromFile using
	 *  a string returned by getRelativePath.
	 *
	 *   @param fromFile
	 *       the file from which the path is relative
	 *   @param relative
	 *       the relative path obtained from getRelativePath
	 */
	setRelativePath(fromFile: nsIFile, relativeDesc: string): void;
}
