import { InternalBrowser } from "../models/InternalBrowser";
import { Ci, E10SUtils, Services } from "../modules";
import { MozURI } from "../types/uri";

class BrowserOptions {
    constructor(private mod: BrowsersAPI, private id: number) {

    }

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
    public internalBrowsers: InternalBrowser[] = [];

    public selectedId: number = -1;
    public previousId: number = -1;

    public selectedInternalId: number = -1;

    public get tabStack() {
        return document.getElementById("browser-tabs-stack");
    }

    public get internalTabStack() {
        return document.getElementById("internal-browser-tabs-stack");
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
        maychangeremoteness: true
    }

    public get aboutBlankURI(): MozURI {
        return Services.io.newURI("about:blank")
    }

    public create(attributes: { [key: string]: any }, url?: MozURI) {
        if (attributes.internal) return this.createInternal(attributes);

        return this.createPublic(attributes, url);
    }

    private createInternal(attributes: { [key: string]: any }) {
        const matched = this.internalBrowsers.find(browser => browser.id == attributes.id);

        if (matched) {
            return matched.select();
        }

        console.log(`#${attributes.id}`)

        const browser: any = this.internalTabStack?.querySelector(`#${attributes.id}`);

        if (browser) {
            const id = this.internalBrowsers.length + 1;

            browser.setAttribute(
                "pageid",
                id.toString()
            );

            if (!attributes.background) {
                this.selectedInternalId = id;

                this.select(id, true);
            }

            return { id };
        } else {
            console.error(`No internal UI found by the id "${attributes.id}".`)
        }
    }

    private createPublic(attributes: { [key: string]: any }, url?: MozURI) {
        const browser: any = document.createXULElement("browser");

        attributes = { ...this.DEFAULT_ATTRIBUTES, ...attributes };

        for (const [key, value] of Object.entries(attributes)) {
            if (key == "background") continue;

            browser.setAttribute(key, value);
        }

        // IMPORTANT! This should happen before we call anything on the browser.
        // this.get(id) depends on the browser being available in tabStack.
        this.tabStack?.appendChild(browser);

        const { browserId: id } = browser;

        this.browsers.set(id, browser);

        browser.options = new BrowserOptions(this, id);
        browser.id = `browser-panel-${id}`;

        this.goto(id, url || this.aboutBlankURI);
        this.initBrowser(browser);

        // background tabs won't be selected after creation
        if (!attributes.background || this.browsers.size == 1) this.select(id);
        else console.warn(`Tab with id "${id}" is a background tab, not selecting.`);

        return browser as any;
    }

    public get(id: number) {
        let browser;
        let internalBrowser;

        try {
            browser = this.tabStack?.querySelector(`#browser-panel-${id}`);
            internalBrowser = this.internalTabStack?.querySelector(`#${id}`);
        } catch (e) {

        }

        if (browser) return browser;
        else if (internalBrowser) return internalBrowser;
        else throw new Error(`Browser with id '${id}' not found.`);
    }

    public delete(id: number) {
        let browser: any = this.get(id);

        this.browsers.delete(id);

        browser?.destroy();
        browser?.remove();

        browser = null;
    }

    public select(id: number, internal?: boolean) {
        if (internal) return this.internalSelect(id);

        const newBrowser: any = this.get(id);

        if (!newBrowser) return console.error(`Unable to switch browser with id "${id}" as it does not exist.`)

        if (this.previousId !== -1) {
            try {
                const previousBrowser: any = this.get(this.previousId);

                previousBrowser.removeAttribute("selected");
            } catch (e) {

            }
        }

        this.selectedId = id;
        this.previousId = this.selectedId;

        if (newBrowser) {
            newBrowser.setAttribute("selected", "");
        }

        this.tabStack?.setAttribute("selectedId", id.toString());
    }

    public internalSelect(id: number) {
        const browser: any = this.internalTabStack?.querySelector(`[pageid="${id}"]`);

        if (!browser) return;

        if (this.internalTabStack)
            Array.from(this.internalTabStack.querySelectorAll("div")).forEach(
                (tab: any) => {
                    if (tab) browser.removeAttribute("selected");
                }
            );

        browser.setAttribute("selected", "");

        if (this.tabStack) this.tabStack.style.display = "none";
        if (this.internalTabStack) this.internalTabStack.style.display = "flex";
    }

    public goto(id: number, url: MozURI, options?: any) {
        const browser: any = this.get(id);

        const triggeringPrincipal = options && options.triggeringPrincipal
            ? options.triggeringPrincipal
            : Services.scriptSecurityManager.getSystemPrincipal();

        browser.loadURI(url.spec, { ...options, triggeringPrincipal });
    }

    private initBrowser(browser: any) {
        let oa = E10SUtils.predictOriginAttributes({ browser });

        const { useRemoteTabs } = window.docShell.QueryInterface(Ci.nsILoadContext);
        const remoteType = E10SUtils.getRemoteTypeForURI(
            browser.currentURI.spec,
            useRemoteTabs /* is multi process browser */,
            false /* fission */,
            E10SUtils.DEFAULT_REMOTE_TYPE,
            null,
            oa
        );

        browser.setAttribute(
            "remoteType",
            remoteType
        );
    }
}