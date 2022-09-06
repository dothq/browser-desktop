import "gecko-types";

declare module "resource://app/modules/DevToolsServer.jsm" {}

declare global {
	/* Only available in secure contexts */
	interface Screen {
		availTop: number;
		availLeft: number;
	}
}
