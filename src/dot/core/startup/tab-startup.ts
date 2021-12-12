import { dot } from "../../api";
import { Services } from "../../modules";
import { timers } from "../../services/timers";
import { openTrustedLinkIn } from "../../utils/browser";

export class TabStartupService {
    public NEW_TAB_URLS_PREF = "dot.newtab.urls";

    public get newtabUrls(): string[] {
        let urls = dot.prefs.get(this.NEW_TAB_URLS_PREF);

        if(urls.includes("|")) {
            urls = urls.split("|");
        } else {
            urls = [urls];
        }

        return urls;
    }

    public launchInitialTabs() {
        for(let url of this.newtabUrls) {
            try {
                Services.io.newURI(url);
            } catch(e) {
                dot.prefs.set(this.NEW_TAB_URLS_PREF, "about:home");
                console.warn(e)
            }
        }

        for(const url of this.newtabUrls) {
            openTrustedLinkIn(
                url,
                "tab",
                {}
            );
        }
    }

    public constructor() {
        timers.start("TabStartup");

        this.launchInitialTabs();

        timers.stop("TabStartup");
    }
}