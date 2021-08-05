import { ExtensionTheme } from "./theme";

export type ExtensionManifestPermission =
    'activeTab' |
    'alarms' |
    'background' |
    'bookmarks' |
    'browserSettings' |
    'browsingData' |
    'captivePortal' |
    'clipboardRead' |
    'clipboardWrite' |
    'contentSettings' |
    'contextMenus' |
    'contextualIdentities' |
    'cookies' |
    'debugger' |
    'dns' |
    'downloads' |
    'downloads.open' |
    'find' |
    'geolocation' |
    'history' |
    'identity' |
    'idle' |
    'management' |
    'menus' |
    'menus.overrideContext' |
    'nativeMessaging' |
    'notifications' |
    'pageCapture' |
    'pkcs11' |
    'privacy' |
    'proxy' |
    'search' |
    'sessions' |
    'storage' |
    'tabHide' |
    'tabs' |
    'theme' |
    'topSites' |
    'unlimitedStorage' |
    'webNavigation' |
    'webRequest' |
    'webRequestBlocking';

export interface ExtensionManifestBrowserSettings {
    gecko?: {
        id?: string,
        update_url?: string

        strict_min_version?: string
        strict_max_version?: string
    },

    // Edge browser settings don't apply to Dot but they are here for reasons
    edge?: {
        browser_action_next_to_addressbar?: boolean
    },

    // Safari browser settings don't apply to Dot but they are here for reasons
    safari?: {
        strict_min_version?: string
        strict_max_version?: string
    }
}

export interface ExtensionManifestThemeIcon {
    light: string,
    dark: string,
    size: 16 | 32 | number
}

export interface ExtensionManifestAction {
    browser_style?: boolean,
    default_icon?: {
        16?: string
        32?: string
    } | string,
    default_title: string,
    default_popup: string
}

export interface ExtensionManifestSearchProvider {
    name: string,
    search_url: string,
    is_default?: boolean,
    alternate_urls?: string[],
    encoding?: string,
    favicon_url?: string,
    image_url?: string,
    image_url_post_params?: string,
    instant_url?: string,
    instant_url_post_params?: string,
    keyword?: string,
    prepopulated_id?: string
    search_url_post_params?: string,
    suggest_url?: string,
    suggest_url_post_params?: string
}

export interface ExtensionManifestContentScript {
    all_frames?: boolean,
    css?: string[],
    exclude_globs?: string[],
    exclude_matches?: string[],
    include_globs?: string[],
    js?: string[],
    match_about_blank?: boolean,
    matches?: string[],
    run_at?: 'document_start' | 'document_end' | 'document_idle'
}

export interface ExtensionManifestProtocol {
    protocol: string,
    name: string,
    uriTemplate: string
}

export interface ExtensionManifestTheme {
    images?: {
        headerURL?: string, // Deprecated use theme_frame instead
        theme_frame?: string,
        additional_backgrounds?: string[]
    },
    colors: ExtensionTheme,
    properties?: {
        additional_backgrounds_alignment?: 'bottom' | 'center' | 'left' | 'right' | 'top' | 'center bottom' | 'center center' | 'center top' | 'left bottom' | 'left center' | 'left top' | 'right bottom' | 'right center' | 'right top',
        additional_backgrounds_tiling?: 'no-repeat' | 'repeat' | 'repeat-x' | 'repeat-y'
    }
}

export interface ExtensionManifest {
    manifest_version: number,

    version: string,
    version_name?: string,

    name: string,
    short_name?: string,
    description?: string,
    author?: string,

    homepage_url?: string,

    background?: {
        scripts?: string[],
        page?: string,
        persistent?: boolean
    },

    browser_action?: ExtensionManifestAction & {
        default_area?: 'navbar' | 'menupanel' | 'tabstrip' | 'personaltoolbar',
        theme_icons: ExtensionManifestThemeIcon[]
    },

    browser_specific_settings?: ExtensionManifestBrowserSettings,

    chrome_settings_overrides?: {
        homepage?: string,
        search_provider?: ExtensionManifestSearchProvider
    },

    chrome_url_overrides?: {
        bookmarks?: string,
        history?: string,
        newtab?: string
    },

    commands?: {
        [key: string]: {
            suggested_key?: {
                default: string,
                mac?: string
                linux?: string
                windows?: string
                chromeos?: string
                android?: string
                ios?: string
            },
            description?: string
        }
    },

    content_scripts?: ExtensionManifestContentScript[],

    content_security_policy?: string,
    default_locale?: string,
    devtools_page?: string,

    developer?: {
        name: string,
        url: string
    },

    dictionaries?: {
        [key: string]: string
    },

    // Not currently supported in Gecko
    externally_connectable?: {
        ids?: string[],
        matches?: string[]
    },

    icons?: {
        [key: number]: string
    },

    incognito?: 'spanning' | 'split' | 'not_allowed',

    offline_enabled?: boolean,

    omnibox?: {
        keyword?: string,
        key?: string
    },

    optional_permissions?: ExtensionManifestPermission[],

    // Deprecated. Use options_ui instead.
    options_page?: string

    options_ui?: {
        page: string,
        open_in_tab?: boolean,
        browser_style?: boolean
    },

    page_action?: ExtensionManifestAction & {
        hide_matches?: string[],
        show_matches?: string[],
        pinned?: boolean
    },

    permissions?: ExtensionManifestPermission[],
    protocol_handlers?: ExtensionManifestProtocol[],

    sidebar_action?: ExtensionManifestAction & {
        open_at_install?: boolean
    },

    storage?: {
        managed_schema: string
    },

    theme?: ExtensionManifestTheme,
    theme_experiment?: {
        stylesheet?: string,
        images?: {
            [key: string]: string
        },
        colors?: {
            [key: string]: string
        },
        properties?: {
            [key: string]: string
        }
    },

    user_scripts?: {
        api_script?: string
    },

    web_accessible_resources?: string[]
}