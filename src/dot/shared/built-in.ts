export const builtInExtensions = [
    {
        id: "light@themes.dothq.co",
        version: 1.2,
        mount: "resource://builtin-themes/light/",
        type: "theme"
    },
    {
        id: "dark@themes.dothq.co",
        version: 1.2,
        mount: "resource://builtin-themes/dark/",
        type: "theme"
    },
    {
        id: "fusion@themes.dothq.co",
        version: 1.0,
        mount: "resource://builtin-themes/fusion/",
        type: "theme"
    }
]

export const builtInPageFavicons: { [key: string]: string } = {
    settings: "chrome://dot/content/skin/icons/settings.svg"
}

export const builtInPageTitles: { [key: string]: string } = {
    settings: "Settings"
}

// privilaged built in pages will have access to the accent colour
export const builtInPrivilaged = ["settings"];