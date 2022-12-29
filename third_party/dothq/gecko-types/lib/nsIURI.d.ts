/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/. */

export interface nsIURI {
    /**
     * Returns a string representation of the URI.
     *
     * Some characters may be escaped.
     */
    readonly spec: string;

    /**
     * The prePath (eg. scheme://user:password@host:port) returns the string
     * before the path.  This is useful for authentication or managing sessions.
     *
     * Some characters may be escaped.
     */
    readonly prePath: string;

    /**
     * The Scheme is the protocol to which this URI refers.  The scheme is
     * restricted to the US-ASCII charset per RFC3986.
     */
    readonly scheme;

    /**
     * The username:password (or username only if value doesn't contain a ':')
     *
     * Some characters may be escaped.
     */
    readonly userPass;

    /**
     * The optional username and password, assuming the preHost consists of
     * username:password.
     *
     * Some characters may be escaped.
     */
    readonly username;
    readonly password;

    /**
     * The host:port (or simply the host, if port == -1).
     */
    readonly hostPort;

    /**
     * The host is the internet domain name to which this URI refers.  It could
     * be an IPv4 (or IPv6) address literal. Otherwise it is an ASCII or punycode
     * encoded string.
     */
    readonly host;

    /**
     * A port value of -1 corresponds to the protocol's default port (eg. -1
     * implies port 80 for http URIs).
     */
    readonly port: number;

    /**
     * The path, typically including at least a leading '/' (but may also be
     * empty, depending on the protocol).
     *
     * Some characters may be escaped.
     *
     * This attribute contains query and ref parts for historical reasons.
     * Use the 'filePath' attribute if you do not want those parts included.
     */
    readonly pathQueryRef: string;


    /************************************************************************
     * An URI supports the following methods:
     */

    /**
     * URI equivalence test (not a strict string comparison).
     *
     * eg. http://foo.com:80/ == http://foo.com/
     */
    equals(uri: nsIURI): boolean;

    /**
     * An optimization to do scheme checks without requiring the users of nsIURI
     * to GetScheme, thereby saving extra allocating and freeing. Returns true if
     * the schemes match (case ignored).
     */
    schemeIs(scheme: string): boolean;

    /**
     * This method resolves a relative string into an absolute URI string,
     * using this URI as the base.
     *
     * NOTE: some implementations may have no concept of a relative URI.
     */
    resolve(relativePath: string): string;


    /************************************************************************
     * Additional attributes:
     */

    /**
     * The URI spec with an ASCII compatible encoding.  Host portion follows
     * the IDNA draft spec.  Other parts are URL-escaped per the rules of
     * RFC2396.  The result is strictly ASCII.
     */
    readonly asciiSpec: string;

    /**
     * The host:port (or simply the host, if port == -1), with an ASCII compatible
     * encoding.  Host portion follows the IDNA draft spec.  The result is strictly
     * ASCII.
     */
    readonly asciiHostPort: number;

    /**
     * The URI host with an ASCII compatible encoding.  Follows the IDNA
     * draft spec for converting internationalized domain names (UTF-8) to
     * ASCII for compatibility with existing internet infrasture.
     */
    readonly asciiHost: string;

    /************************************************************************
     * Additional attribute & methods added for .ref support:
     */

    /**
     * Returns the reference portion (the part after the "#") of the URI.
     * If there isn't one, an empty string is returned.
     *
     * Some characters may be escaped.
     */
    readonly ref: string;

    /**
     * URI equivalence test (not a strict string comparison), ignoring
     * the value of the .ref member.
     *
     * eg. http://foo.com/# == http://foo.com/
     *     http://foo.com/#aaa == http://foo.com/#bbb
     */
    equalsExceptRef(uri: nsIURI): boolean;

    /**
     * returns a string for the current URI with the ref element cleared.
     */
    readonly specIgnoringRef: string;

    /**
     * Returns if there is a reference portion (the part after the "#") of the URI.
     */
    readonly hasRef: boolean;

    /************************************************************************
     * Additional attributes added for .query support:
     */

    /**
     * Returns a path including the directory and file portions of a
     * URL.  For example, the filePath of "http://host/foo/bar.html#baz"
     * is "/foo/bar.html".
     *
     * Some characters may be escaped.
     */
    readonly filePath: string;

    /**
     * Returns the query portion (the part after the "?") of the URL.
     * If there isn't one, an empty string is returned.
     *
     * Some characters may be escaped.
     */
    readonly query: string;

    /**
     * If the URI has a punycode encoded hostname, this will hold the UTF8
     * representation of that hostname (if that representation doesn't contain
     * blacklisted characters, and the network.IDN_show_punycode pref is false)
     * Otherwise, if the hostname is ASCII, it will return the same as .asciiHost
     */
    readonly displayHost: string;

    /**
     * The displayHost:port (or simply the displayHost, if port == -1).
     */
    readonly displayHostPort: string;

    /**
     * Returns the same as calling .spec, only with a UTF8 encoded hostname
     * (if that hostname doesn't contain blacklisted characters, and
     * the network.IDN_show_punycode pref is false)
     */
    readonly displaySpec: string;

    /**
     * Returns the same as calling .prePath, only with a UTF8 encoded hostname
     * (if that hostname doesn't contain blacklisted characters, and
     * the network.IDN_show_punycode pref is false)
     */
    readonly displayPrePath: string;

    /**
     * Returns an nsIURIMutator that can be used to make changes to the URI.
     * After performing the setter operations on the mutator, one may call
     * mutator.finalize() to get a new immutable URI with the desired
     * properties.
     */
    mutate(): any;

    /**
     * Serializes a URI object to a URIParams data structure in order for being
     * passed over IPC.  For deserialization, see nsIURIMutator.
     */
    serialize(params: any): void;
}