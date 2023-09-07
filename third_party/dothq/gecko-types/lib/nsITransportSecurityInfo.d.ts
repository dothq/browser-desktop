/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { nsIX509Cert } from "./nsIX509Cert";

export interface nsITransportSecurityInfo {
	readonly securityState: number;
	readonly errorCode: number; // PRErrorCode
	// errorCode as string (e.g. "SEC_ERROR_UNKNOWN_ISSUER")
	readonly errorCodeString: string;

	/**
	 * The following parameters are only valid after the TLS handshake
	 * has completed.  Check securityState first.
	 */

	/**
	 * If certificate verification failed, this will be the peer certificate
	 * chain provided in the handshake, so it can be used for error reporting.
	 * If verification succeeded, this will be empty.
	 */
	readonly failedCertChain: nsIX509Cert[];

	readonly serverCert: nsIX509Cert;
	readonly succeededCertChain: nsIX509Cert[];

	readonly cipherName: string;

	readonly keyLength: number;

	readonly secretKeyLength: number;

	readonly keaGroupName: string;

	readonly signatureSchemeName: string;

	SSL_VERSION_3: 0;
	TLS_VERSION_1: 1;
	TLS_VERSION_1_1: 2;
	TLS_VERSION_1_2: 3;
	TLS_VERSION_1_3: 4;

	readonly protocolVersion: number;

	CERTIFICATE_TRANSPARENCY_NOT_APPLICABLE: 0;
	CERTIFICATE_TRANSPARENCY_POLICY_COMPLIANT: 5;
	CERTIFICATE_TRANSPARENCY_POLICY_NOT_ENOUGH_SCTS: 6;
	CERTIFICATE_TRANSPARENCY_POLICY_NOT_DIVERSE_SCTS: 7;

	readonly certificateTransparencyStatus: number;

	readonly isAcceptedEch: boolean;

	readonly isDelegatedCredential: boolean;

	readonly overridableErrorCategory: number;

	/**
	 * True if OCSP requests were made to query the status of certificates
	 * used in this connection.
	 */

	readonly madeOCSPRequests: boolean;

	/**
	 * True if the DNS record used for this connection was fetched over an encrypted connection.
	 */

	readonly usedPrivateDNS: boolean;

	/**
	 * True only if (and after) serverCert was successfully validated as
	 * Extended Validation (EV).
	 */

	readonly isExtendedValidation: boolean;

	/**
	 * Serializes the data represented in this interface to a base64-encoded
	 * string that can be deserialized using TransportSecurityInfo::Read.
	 */

	toString(): string;

	/* negotiatedNPN is '' if no NPN list was provided by the client,
	 * or if the server did not select any protocol choice from that
	 * list. That also includes the case where the server does not
	 * implement NPN.
	 *
	 * If negotiatedNPN is read before NPN has progressed to the point
	 * where this information is available NS_ERROR_NOT_CONNECTED is
	 * raised.
	 */
	readonly negotiatedNPN: string;

	/**
	 * True iff the connection was resumed using the resumption token.
	 */
	readonly resumed: boolean;

	/**
	 * True iff the succeededCertChain is built in root.
	 */
	readonly isBuiltCertChainRootBuiltInRoot: boolean;

	/**
	 * The id used to uniquely identify the connection to the peer.
	 */
	readonly peerId: string;
}
