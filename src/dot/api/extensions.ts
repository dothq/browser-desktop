import { AddonManager } from "../modules";
import { builtInExtensions } from "../shared/built-in";

export class ExtensionsAPI {
    private builtInExtensions = builtInExtensions;

    public loadBuiltInExtensions() {
        for (const { id, version, mount } of this.builtInExtensions) {
            AddonManager.maybeInstallBuiltinAddon(
                id,
                version.toString(),
                mount
            );
        }
    }

    constructor() {
        this.loadBuiltInExtensions();
    }
}