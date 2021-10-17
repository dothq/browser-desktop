import { dot } from ".";
import { Ci, E10SUtils, Services } from "../modules";
import { MozURI } from "../types/uri";

class BrowserOptions {
    constructor(
        private mod: BrowsersAPI,
        private id: number
    ) {}

    public set(key: string, value: any) {
        const browser = this.mod.get(this.id);

        browser.setAttribute(key, value);
    }

    public remove(key: string, value: any) {
        const browser = this.mod.get(this.id);

        browser.removeAttribute(key);
    }
}

export class BrowsersAPI {
    public browsers: Map<number, HTMLElement> = new Map();

    public selectedId: number = -1;
    public previousId: number = -1;

    public get tabStack() {
        return document.getElementById(
            "browser-tabs-stack"
        );
    }

    public DEFAULT_ATTRIBUTES = {
        type: "content",
        context: "contentAreaContextMenu",
        tooltip: "aHTMLTooltip",
        autocompletepopup: "PopupAutoComplete",
        selectmenulist: "ContentSelectDropdown",
        message: true,
        messagemanagergroup: "browsers",
        remote: true,
        maychangeremoteness: true,
        autoscroll: true
    };

    public get aboutBlankURI(): MozURI {
        return Services.io.newURI("about:blank");
    }

    public create(
        attributes: { [key: string]: any },
        url?: MozURI
    ) {
        const browserSidebarContainer =
            document.createElement("div");
        browserSidebarContainer.classList.add(
            "browserSidebarContainer"
        );

        const browserStatus =
            document.createElement("div");
        browserStatus.classList.add("browserStatus");
        browserStatus.setAttribute("data-side", "left");

        browserStatus.addEventListener(
            "mouseover",
            () => {
                const currentSide =
                    browserStatus.getAttribute(
                        "data-side"
                    );

                if (currentSide == "left") {
                    browserStatus.setAttribute(
                        "data-side",
                        "right"
                    );
                } else {
                    browserStatus.setAttribute(
                        "data-side",
                        "left"
                    );
                }
            }
        );

        const browserContainer =
            document.createElement("div");
        browserContainer.classList.add(
            "browserContainer"
        );

        const browserStack =
            document.createElement("div");
        browserStack.classList.add("browserStack");

        const browser: any =
            document.createXULElement("browser");

        attributes = {
            ...this.DEFAULT_ATTRIBUTES,
            ...attributes
        };

        for (const [key, value] of Object.entries(
            attributes
        )) {
            if (key == "background") continue;

            browser.setAttribute(key, value);
        }

        // IMPORTANT! This should happen before we call anything on the browser.
        // this.get(id) depends on the browser being available in tabStack.
        browserStack.appendChild(browser);

        browserContainer.appendChild(browserStack);
        browserContainer.appendChild(browserStatus);

        browserSidebarContainer.appendChild(
            browserContainer
        );
        this.tabStack?.appendChild(
            browserSidebarContainer
        );

        const { browserId: id } = browser;

        this.browsers.set(id, browser);

        browser.options = new BrowserOptions(this, id);
        browser.id = `browser-panel-${id}`;

        this.goto(id, url || this.aboutBlankURI);
        this.initBrowser(browser);

        // background tabs won't be selected after creation
        if (
            !attributes.background ||
            this.browsers.size == 1
        )
            this.select(id);
        else
            console.warn(
                `Tab with id "${id}" is a background tab, not selecting.`
            );

        return browser as any;
    }

    public get(id: number) {
        let browser;

        try {
            browser = this.tabStack?.querySelector(
                `#browser-panel-${id}`
            );
        } catch (e) {}

        if (browser) return browser;
        else
            throw new Error(
                `Browser with id '${id}' not found.`
            );
    }

    public findInPage() {
        const browser = this.get(this.selectedId);
        const findBar =
            document.createXULElement("findbar");

        browser.parentNode?.appendChild(findBar);
    }

    public delete(id: number) {
        let browser: any = this.get(id);

        this.browsers.delete(id);

        browser?.destroy();
        browser?.remove();

        browser = null;
    }

    public select(id: number) {
        const newBrowser: any = this.get(id);

        if (!newBrowser)
            return console.error(
                `Unable to switch browser with id "${id}" as it does not exist.`
            );

        if (this.previousId !== -1) {
            try {
                const previousBrowser: any = this.get(
                    this.previousId
                );
                const previousContainer =
                    dot.tabs.getPanel(previousBrowser);

                previousContainer.removeAttribute(
                    "selected"
                );
            } catch (e) {}
        }

        this.selectedId = id;
        this.previousId = this.selectedId;

        if (newBrowser) {
            const browserContainer =
                dot.tabs.getPanel(newBrowser);

            browserContainer.setAttribute("selected", "");
        }

        this.tabStack?.setAttribute(
            "selectedId",
            id.toString()
        );
    }

    public goto(id: number, url: MozURI, options?: any) {
        const browser: any = this.get(id);

        const triggeringPrincipal =
            options && options.triggeringPrincipal
                ? options.triggeringPrincipal
                : Services.scriptSecurityManager.getSystemPrincipal();

        browser.loadURI(url.spec, {
            ...options,
            triggeringPrincipal
        });
    }

    private initBrowser(browser: any) {
        let oa = E10SUtils.predictOriginAttributes({
            browser
        });

        const { useRemoteTabs } =
            window.docShell.QueryInterface(
                Ci.nsILoadContext
            );
        const remoteType = E10SUtils.getRemoteTypeForURI(
            browser.currentURI.spec,
            useRemoteTabs /* is multi process browser */,
            false /* fission */,
            E10SUtils.DEFAULT_REMOTE_TYPE,
            null,
            oa
        );

        browser.setAttribute("remoteType", remoteType);
    }
}
