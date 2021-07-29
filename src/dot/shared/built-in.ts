export const builtInExtensions = [
    {
        id: "light@themes.dothq.co",
        version: 1.2,
        mount: "resource://builtin-themes/light/"
    },
    {
        id: "dark@themes.dothq.co",
        version: 1.2,
        mount: "resource://builtin-themes/dark/"
    },
    {
        id: "fusion@themes.dothq.co",
        version: 1.0,
        mount: "resource://builtin-themes/fusion/"
    }
]

export const builtInPageFavicons: { [key: string]: string } = {
    settings: "chrome://dot/content/skin/icons/settings.svg"
}