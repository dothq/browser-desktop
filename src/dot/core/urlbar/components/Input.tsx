import { observer } from "mobx-react";
import React from "react";
import { dot } from "../../../api";
import { Cc, Ci, Services } from "../../../modules";
import { isBlankPageURL } from "../../../shared/url";
import { ipc } from "../../ipc";

interface MozInputElement extends HTMLInputElement {
    editor: any;
}

@observer
export class UrlbarInput extends React.Component {
    public inputRef = React.createRef<MozInputElement>();

    public state = {
        focused: false,
        urlMetadata: null,
        value: "",
        hasSelectedAll: false
    }

    public lockupMetadataMethod: boolean = false;

    public get editor() {
        return this.inputRef.current?.editor;
    }

    public get selectionController() {
        return this.editor.selectionController;
    } 
    
    public update(data?: { via?: 'external' | 'user', value?: string }) {
        console.log(data)

        if(data?.value) {
            const hideUrl = (
                data.via == "external" &&
                isBlankPageURL(data.value)
            );

            this.setState({
                ...this.state,
                value: hideUrl ? "" : data.value
            });
        }

        if(
            data?.via == "external" &&
            data.value?.length
        ) {
            // An external event has forced the value to be updated
            // This could be the page reloading or the location changing
            // We will need to invalidate the user's own input

            this.formatUrl();
        } else {
            this.clearFormatting();
        }
    }

    public formatUrl() {
        const inputValue = this.editor.rootElement.firstChild;
        const metadata = this.getUrlMetadata(inputValue.data);

        if(!metadata) return; 

        const {
            preDomain,
            origin,
            domain,
            trimmedLength,
            url
        } = metadata;

        let baseDomain = "";
        let subDomain = "";

        try {
            baseDomain = Services.eTLD.getBaseDomainFromHost(origin);
            if (!domain.endsWith(baseDomain)) {
                const IDNService = Cc["@mozilla.org/network/idn-service;1"].getService(
                    Ci.nsIIDNService
                );

                baseDomain = IDNService.convertACEtoUTF8(baseDomain);
            }
        } catch (e) {}

        if (baseDomain !== domain) {
            subDomain = domain.slice(0, -baseDomain.length);
        }

        const selection = this.selectionController
            .getSelection(9);

        const rangeLength = preDomain.length + subDomain.length - trimmedLength;

        if (rangeLength) {
            const range = document.createRange();

            range.setStart(inputValue, 0);
            range.setEnd(inputValue, rangeLength);

            selection.addRange(range);
        }

        const startRest = preDomain.length + domain.length - trimmedLength;
        
        if (startRest < url.length - trimmedLength) {
            const range = document.createRange();

            range.setStart(inputValue, startRest);
            range.setEnd(inputValue, url.length - trimmedLength);
            
            selection.addRange(range);
        }
    }

    public clearFormatting() {
        const strikeOut = this.selectionController
            .getSelection(10);
            
        const dimmedUrl = this.selectionController
            .getSelection(9);

        strikeOut.removeAllRanges();
        dimmedUrl.removeAllRanges();
    }

    public getUrlMetadata(url: string): any {
        if (this.state.urlMetadata !== null) return this.state.urlMetadata;
      
        let fixupFlags =
            Services.uriFixup.FIXUP_FLAG_FIX_SCHEME_TYPOS |
            Services.uriFixup.FIXUP_FLAG_ALLOW_KEYWORD_LOOKUP;
            
        if (dot.window.isPrivate()) {
            fixupFlags |= Services.uriFixup.FIXUP_FLAG_PRIVATE_CONTEXT;
        }

        let urlInfo;

        try {
            urlInfo = Services.uriFixup.getFixupURIInfo(
                url, 
                fixupFlags
            );
        } catch (e) {
            console.warn(e);
        }
   
        if (
            !urlInfo ||
            !urlInfo.fixedURI ||
            !["http", "https", "ftp"].includes(urlInfo.fixedURI.scheme)
        ) {
            return null;
        }
      
        let trimmedLength = 0;

        if (
            urlInfo.fixedURI.scheme == "http" && 
            !url.startsWith("http://")
        ) {
            url = `http://${url}`;
            trimmedLength = "http://".length;
        }
      
        const match = url.match(
            /^(([a-z]+:\/\/)(?:[^\/#?]+@)?)(\S+?)(?::\d+)?\s*(?:[\/#?]|$)/
        );

        if (!match) {
            return null;
        }

        const [
            ,
            preDomain,
            schemeWithSlashes,
            domain
        ] = match;
      
        let replaceUrl = false;

        try {
            const { displayHost } = Services.io.newURI("http://" + domain);

            replaceUrl = displayHost !== urlInfo.fixedURI.displayHost;
        } catch (e) {}

        if (replaceUrl) {
            if (this.lockupMetadataMethod || !this.inputRef.current) return;
            
            try {
                this.lockupMetadataMethod = true;

                this.inputRef.current.value = urlInfo.fixedURI.spec;

                return this.getUrlMetadata(urlInfo.fixedURI.spec);
            } finally {
                this.lockupMetadataMethod = false;
            }
        }

        this.setState({
            ...this.state,
            urlMetadata: {
                domain,
                origin: urlInfo.fixedURI.host,
                preDomain,
                schemeWithSlashes,
                trimmedLength,
                url,
            }
        })
      
        return this.state.urlMetadata;
    }

    public constructor(props: any) {
        super(props);

        ipc.on("location-change", (event) => {
            if(
                event.data.id == dot.tabs.selectedTabId && 
                event.data.webProgress &&
                event.data.webProgress.isTopLevel
            ) {
                // If the location has changed, force the input to change
                this.update({ via: "external", value: event.data.location.spec });
            }
        })
        
        ipc.on("page-reload", (event) => {
            if(
                event.data == dot.tabs.selectedTabId
            ) {
                // If the page has reloaded, force the input to change
                this.update({ via: "external", value: this.state.value });
            }
        })
    }

    public onChange(e: any) {
        this.update({ via: "user", value: e.target.value });
    }

    public onFocus() {
        this.clearFormatting();
    }

    public onBlur() {
        this.formatUrl();

        this.setState({
            ...this.state,
            hasSelectedAll: false
        });
    }

    public onMouseUp(e: any) {
        if(!this.state.hasSelectedAll) {
            this.inputRef.current?.select();

            this.setState({
                ...this.state,
                hasSelectedAll: true
            });
        }
    }
    
    public render() {
        return (
            <input 
                id="urlbar-input"
                {...{ anonid: "input" }}
                aria-autocomplete="both"
                ref={this.inputRef}
                value={this.state.value}
                inputMode={"mozAwesomebar" as any}
                placeholder={"Search using DuckDuckGo or enter address"}
                /* Events */
                onFocus={(e) => this.onFocus()}
                onBlur={(e) => this.onBlur()}
                onChange={(e) => this.onChange(e)}
                onMouseUp={(e) => this.onMouseUp(e)}
            />
        )
    }
}