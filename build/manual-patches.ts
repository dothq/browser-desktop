export default [
    {
        name: "branding",
        action: "copy",
        src: "browser/branding/dot"
    },
    {
        name: "fusion",
        action: "copy",
        src: "browser/themes/addons/fusion"
    },
    {
        name: "dotui",
        action: "copy",
        src: "browser/themes/shared/dotui"
    },
    {
        name: "about:history",
        action: "copy",
        src: [
            "browser/components/abouthistory",
            "browser/locales/en-US/browser/aboutHistory.ftl"
        ]
    }
]