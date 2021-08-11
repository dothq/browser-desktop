import React from "react"
import { ContextMenu } from "../components/ContextMenu"
import { ContextMenuItem } from "../components/ContextMenuItem"
import { MozURI } from "../types/uri"

export type MenuType = 'normal' | 'separator' | 'checkbox' | 'radio'

// Translations between macOS -> other OSes
//    - Ctrl <-> Cmd
//    - Shift <-> Option
//    - Alt <-> Control
//    - Super <-> Cmd
export type MenuHotkey = 'Ctrl' |
    'Shift' |
    'Alt' |
    'Super' |
    string

export interface MenuItem {
    id?: string,

    label?: string,
    icon?: string,
    iconColour?: string,
    hotkey?: MenuHotkey[],
    type?: MenuType,

    visible?: boolean,
    disabled?: boolean,

    click?: (...args: any[]) => void,
    hover?: (...args: any[]) => void,

    submenu?: MenuItem[]
}

interface MenuContextPrincipal {
    URI: MozURI,
    addonId: string
    addonPolicy: null
    asciiHost: string
    asciiSpec: string
    baseDomain: string
    exposablePrePath: string
    exposableSpec: string
    filePath: string
    host: string
    hostPort: string
    isAddonOrExpandedAddonPrincipal: boolean
    isContentPrincipal: boolean
    isExpandedPrincipal: boolean
    isInIsolatedMozBrowserElement: boolean
    isIpAddress: boolean
    isLocalIpAddress: boolean
    isNullPrincipal: boolean
    isOnion: boolean
    isOriginPotentiallyTrustworthy: boolean
    isScriptAllowedByPolicy: boolean
    isSystemPrincipal: boolean
    localStorageQuotaKey: string
    nextSubDomainPrincipal: null
    origin: string
    originAttributes: {
        firstPartyDomain: string
        geckoViewSessionContextId: string
        inIsolatedMozBrowser: boolean
        partitionKey: string
        privateBrowsingId: number
        userContextId: number
    },
    originNoSuffix: string
    originSuffix: string
    prepath: string
    privateBrowsingId: number
    scheme: string
    siteOrigin: string
    siteOriginNoSuffix: string
    spec: string
    storageOriginKey: string
    userContextId: number
}

export interface MenuContext {
    inAboutDevtoolsToolbox: boolean
    onPlainTextLink: boolean
    textSelected: string
    bgImageURL: string
    canSpellCheck: boolean
    clientX: number
    clientY: number
    csp: string
    frameBrowsingContextID: number
    frameID: number
    frameOuterWindowID: number
    hasBGImage: boolean
    hasMultipleBGImages: boolean
    imageDescURL: string
    imageInfo: null
    inFrame: boolean
    inPDFViewer: boolean
    inSrcdocFrame: boolean
    inSyntheticDoc: boolean
    inTabBrowser: boolean
    inWebExtBrowser: boolean
    isDesignMode: boolean
    link: HTMLElement
    linkDownload: string
    linkProtocol: string
    linkTextStr: string
    linkURL: string
    mediaURL: string
    mozInputSource: number
    onAudio: boolean
    onCanvas: boolean
    onCompletedImage: boolean
    onDRMMedia: boolean
    onEditable: boolean
    onImage: boolean
    onKeywordField: number
    onLink: boolean
    onLoadedImage: boolean
    onMailtoLink: boolean
    onMozExtLink: boolean
    onNumeric: boolean
    onPassword: boolean
    onPiPVideo: boolean
    onSaveableLink: boolean
    onSpellcheckable: boolean
    onTextInput: boolean
    onVideo: boolean
    principal: MenuContextPrincipal,
    screenX: number
    screenY: number
    shouldDisplay: boolean
    shouldInitInlineSpellCheckerUINoChildren: boolean
    shouldInitInlineSpellCheckerUIWithChildren: boolean
    storagePrincipal: MenuContextPrincipal
    target: any,
    targetIdentifier: {
        browsingContextId: number,
        id: number
    },
    timeStamp: number
    webExtBrowserType: string
}

export class Menu {
    static buildFromTemplate(template: {
        id: string,
        menu: MenuItem[],
        iconPrefix?: string
    }) {
        const M = () => (
            <ContextMenu id={template.id} key={template.id}>
                {template.menu.map((menuitem, index) => (
                    <ContextMenuItem
                        {...menuitem}
                        key={menuitem.id || `${menuitem.type || "normal"}-${index}`}
                        icon={template.iconPrefix
                            ? `${template.iconPrefix}${menuitem.icon}`
                            : menuitem.icon
                        }
                    />
                ))}
            </ContextMenu>
        )

        return M;
    }
}