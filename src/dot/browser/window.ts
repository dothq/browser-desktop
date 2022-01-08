import L10n from "l10n";
import { Cc, Ci } from "mozilla";
import { Browser } from "..";

export class BrowserWindow {
    private windowClass = new Set();

    /*
     * Get the visibility of the browser window
     */
    public get visible() {
        return window.docShell.treeOwner.QueryInterface(
            Ci.nsIBaseWindow
        ).visibility;
    }

    /*
     * Set the visibility of the browser window
     */
    public set visible(value: boolean) {
        window.docShell.treeOwner.QueryInterface(
            Ci.nsIBaseWindow
        ).visibility = value;
    }

    /*
     * Get the user's preference of language
     */
    public get language() {
        try {
            const definedLang =
                this.browser.preferences.get(
                    "dot.ui.locale",
                    ""
                ) as string;

            if (definedLang && definedLang.length) {
                const localeRegex =
                    /^([a-z]{2})(-[A-Z]{2})?$/;
                const match =
                    definedLang.match(localeRegex);

                if (
                    match &&
                    match[0] &&
                    match[0] == definedLang
                ) {
                    return definedLang;
                }
            }

            const systemLocales = Cc[
                "@mozilla.org/intl/ospreferences;1"
            ].getService(
                Ci.mozIOSPreferences
            ).systemLocales;

            return systemLocales[0];
        } catch (e) {
            return L10n.defaultLocale;
        }
    }

    /*
     * Add a class to a target
     */
    public addClass(
        name: string,
        condition?: boolean,
        target?: HTMLElement
    ) {
        if (
            typeof condition == "boolean" &&
            condition == false
        )
            return;

        const element = target
            ? target
            : document.getElementById("browser");

        element?.classList.add(name);
        this.windowClass.add(name);
    }

    /*
     * Remove a class from a target
     */
    public removeClass(
        name: string,
        target?: HTMLElement
    ) {
        const element = target
            ? target
            : document.getElementById("browser");

        element?.classList.remove(name);
        this.windowClass.delete(name);
    }

    /*
     * Toggle a class on a target
     */
    public toggleClass(
        name: string,
        condition: boolean,
        target?: HTMLElement
    ) {
        if (condition)
            this.addClass(name, condition, target);
        else this.removeClass(name, target);
    }

    /*
     * Remove all classes starting with the prefix on a target
     */
    public removeClassByNamespace(
        prefix: string,
        target?: HTMLElement
    ) {
        const element = target
            ? target
            : document.getElementById("browser");

        element?.classList.forEach((i) => {
            if (i.startsWith(prefix)) {
                element?.classList.remove(i);
                this.windowClass.delete(i);
            }
        });
    }

    /*
     * Toggle an attribute on a target
     */
    public toggleAttribute(
        key: string,
        value: string,
        initialValue?: boolean
    ) {
        const browserMount =
            document.getElementById("browser");

        if (!browserMount?.getAttribute(key)) {
            return browserMount?.setAttribute(key, value);
        }

        document
            .getElementById("browser")
            ?.toggleAttribute(key, initialValue);
    }

    public constructor(private browser: Browser) {}
}
