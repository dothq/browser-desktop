/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

export interface nsIX509CertValidity {
	/**
	 *  The earliest point in time where
	 *  a certificate is valid.
	 */
	readonly notBefore: number;

	/**
	 *  The latest point in time where
	 *  a certificate is valid.
	 */
	readonly notAfter: number;
}

export interface nsIX509Cert {
	/**
	 *  The primary email address of the certificate, if present.
	 */
	readonly emailAddress: string;

	/**
	 * Did this certificate ship with the platform as a built-in root?
	 */

	readonly isBuiltInRoot: boolean;

	/**
	 *  Obtain a list of all email addresses
	 *  contained in the certificate.
	 *
	 *  @return An array of email addresses.
	 */

	getEmailAddresses(): string[];

	/**
	 *  Check whether a given address is contained in the certificate.
	 *  The comparison will convert the email address to lowercase.
	 *  The behaviour for non ASCII characters is undefined.
	 *
	 *  @param aEmailAddress The address to search for.
	 *
	 *  @return True if the address is contained in the certificate.
	 */
	containsEmailAddress(emailAddress: string): boolean;

	/**
	 *  The subject owning the certificate.
	 */
	readonly subjectName: string;

	/**
	 *  The subject's common name.
	 */
	readonly commonName: string;

	/**
	 *  The subject's organization.
	 */
	readonly organization: string;

	/**
	 *  The subject's organizational unit.
	 */

	readonly organizationalUnit: string;

	/**
	 *  The fingerprint of the certificate's DER encoding,
	 *  calculated using the SHA-256 algorithm.
	 */
	readonly sha256Fingerprint: string;

	/**
	 *  The fingerprint of the certificate's DER encoding,
	 *  calculated using the SHA1 algorithm.
	 */

	readonly sha1Fingerprint: string;

	/**
	 *  A human readable name identifying the hardware or
	 *  software token the certificate is stored on.
	 */
	readonly tokenName: string;

	/**
	 *  The subject identifying the issuer certificate.
	 */
	readonly issuerName: string;

	/**
	 *  The serial number the issuer assigned to this certificate.
	 */

	readonly serialNumber: string;

	/**
	 *  The issuer subject's common name.
	 */

	readonly issuerCommonName: string;

	/**
	 *  The issuer subject's organization.
	 */
	readonly issuerOrganization: string;

	/**
	 *  The issuer subject's organizational unit.
	 */

	readonly issuerOrganizationUnit: string;

	/**
	 *  This certificate's validity period.
	 */
	readonly validity: nsIX509CertValidity;

	/**
	 *  A unique identifier of this certificate within the local storage.
	 */

	readonly dbKey: string;

	/**
	 *  A human readable identifier to label this certificate.
	 */

	readonly displayName: string;

	/**
	 *  Constants to classify the type of a certificate.
	 */
	UNKNOWN_CERT: number;
	CA_CERT: number;
	USER_CERT: number;
	EMAIL_CERT: number;
	SERVER_CERT: number;
	ANY_CERT: number;

	/**
	 * Type of this certificate
	 */
	readonly certType: number;

	/**
	 *  Obtain a raw binary encoding of this certificate
	 *  in DER format.
	 *
	 *  @return The bytes representing the DER encoded certificate.
	 */

	getRawDER(): any[];

	/**
	 *  Obtain a base 64 string representation of this certificate
	 *  in DER format.
	 *
	 *  @return The DER encoded certificate as a string.
	 */

	getBase64DERString(): string;

	/**
	 * The base64 encoding of the DER encoded public key info using the specified
	 * digest.
	 */

	readonly sha256SubjectPublicKeyInfoDigest: string;
}
