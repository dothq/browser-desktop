import { UIDialog } from "../dialogs";
import { SiteIdentityMainScreen } from "./main";
import { SiteIdentitySecurityScreen } from "./security";

enum SiteIdentityScreen {
    Main,
    Security,
}

export class SiteIdentityDialog extends UIDialog {
    public currentScreen = SiteIdentityScreen.Main;

    public constructor() {
        super();

        this.registerScreen(
            SiteIdentityScreen.Main,
            SiteIdentityMainScreen
        );

        this.registerScreen(
            SiteIdentityScreen.Security,
            SiteIdentitySecurityScreen
        );
    }
}