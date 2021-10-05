/**
 * Recreated from `Services.io.newURI()`. Can be created using that method.
 *
 * ```ts
 * const url: MozURI = Services.io.newURI("http://example.com/");
 * ```
 */
export interface MozURI {
    asciiHost: string;
    asciiHostPort: string;
    asciiSpec: string;
    displayHost: string;
    displayHostPort: string;
    displayPrePath: string;
    displaySpec: string;
    equals: (uri: MozURI) => boolean;
    equalsExceptRef: (uri: MozURI) => boolean;
    filePath: string;
    hasRef: false;
    host: string;
    hostPort: string;
    mutate: void;
    password: string;
    pathQueryRef: string;
    port: number;
    prePath: string;
    query: string;
    ref: string;
    resolve: void;
    scheme: string;
    schemeIs: (scheme: string) => boolean;
    spec: string;
    specIgnoringRef: string;
    userPass: string;
    username: string;
}
