import { Ci, E10SUtils, Services } from "../modules";

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

    public selectedId: number = -1;
    public previousId: number = -1;

    public get tabStack() {
        return document.getElementById("browser-tabs-stack");
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

    public create(attributes: { [key: string]: any }, url?: string) {
        const browser: any = document.createXULElement("browser");

        attributes = { ...this.DEFAULT_ATTRIBUTES, ...attributes };

        for (const [key, value] of Object.entries(attributes)) {
            browser.setAttribute(key, value);
        }

        // IMPORTANT! This should happen before we call anything on the browser.
        // this.get(id) depends on the browser being available in tabStack.
        this.tabStack?.appendChild(browser);

        const { browserId: id } = browser;
        
        this.browsers.set(id, browser);

        browser.options = new BrowserOptions(this, id);
        browser.id = `browser-panel-${id}`;

        this.goto(id, url || "about:blank");
        this.initBrowser(browser);

        // background tabs won't be selected after creation
        if (!attributes.background || this.browsers.size == 1) this.select(id);
        else console.warn(`Tab with id "${id}" is a background tab, not selecting.`);

        return browser as any;
    }

    public get(id: number) {
        let browser = this.tabStack?.querySelector(`#browser-panel-${id}`);

        if (browser) return browser;
        else throw new Error(`Browser with id '${id}' not found.`);
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

        if(!newBrowser) return console.error(`Unable to switch browser with id "${id}" as it does not exist.`)

        if (this.previousId !== -1) {
            const previousBrowser: any = this.get(this.previousId);

            previousBrowser.style.display = "";   
        }

        this.selectedId = id;
        this.previousId = this.selectedId;

        if (newBrowser) {
            newBrowser.style.display = "flex";
        }

        this.tabStack?.setAttribute("selectedId", id.toString());
    }

    public goto(id: number, url: string) {
        const browser: any = this.get(id);

        const triggeringPrincipal = Services.scriptSecurityManager.getSystemPrincipal();
        browser.loadURI(url, { triggeringPrincipal }); 
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