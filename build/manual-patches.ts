import { IPatch } from "./interfaces/patch";

const manualPatches: IPatch[] = [
    {
        name: "branding",
        action: "copy",
        src: "browser/branding/dot"
    },
    {
        name: "dotui",
        action: "copy",
        src: [
            "browser/themes/shared/dotui",
            "browser/themes/windows/dotui",
            "browser/themes/osx/dotui",
            "browser/themes/linux/dotui"
        ]
    },
    {
        name: "about:history",
        action: "copy",
        src: [
            "browser/components/abouthistory",
            "browser/actors/AboutHistoryChild.jsm",
            "browser/actors/AboutHistoryParent.jsm"
        ]
    },
    {
        name: "preferences",
        action: "copy",
        src: "browser/components/preferences/new"
    },
    {
        name: "dotprotocol",
        action: "copy",
        src: "toolkit/components/dotprotocol"
    },
    {
        name: "engines",
        action: "copy",
        src: [
            "browser/components/search/extensions/ddg",
            "browser/components/search/extensions/ecosia",
            "browser/components/search/extensions/bing",
            "browser/components/search/extensions/google",
            "browser/components/search/extensions/qwant",
            "browser/components/search/extensions/startpage"
        ]
    },
    {
        name: "themes",
        action: "copy",
        src: [
            "toolkit/mozapps/extensions/default-theme",
            "browser/themes/addons/fusion",
            "browser/themes/addons/light",
            "browser/themes/addons/dark",

            "toolkit/mozapps/extensions/content/default-theme.svg",
            "toolkit/mozapps/extensions/content/firefox-compact-dark.svg",
            "toolkit/mozapps/extensions/content/firefox-compact-light.svg",
            "toolkit/mozapps/extensions/content/firefox-compact-fusion.svg"
        ]
    },
    {
        name: "icons",
        action: "copy",
        src: [
            "browser/themes/shared/icons/spell-check.svg",
            "browser/themes/shared/icons/qr-code.svg",
            "browser/themes/shared/icons/certificate.svg",
            "browser/themes/shared/icons/cookies.svg",

            "browser/themes/shared/notification-icons/javascript.svg",
            "browser/themes/shared/notification-icons/location.svg"
        ]
    },
    {
        name: "extensions",
        action: "copy",
        src: [
            "browser/extensions/shield",
            "browser/extensions/qrcodes",
            "browser/extensions/ntp"
        ]
    },
    {
        name: "l10n",
        action: "copy",
        src: [
            "browser/locales/en-US/browser/qr-codes.ftl",
            "browser/locales/en-US/browser/aboutPreferences.ftl",
            "browser/locales/en-US/browser/aboutHistory.ftl",
            "browser/locales/en-US/browser/onboarding.ftl"
        ]
    },
    {
        name: "sidebars",
        action: "copy",
        src: ["browser/components/sidebars"]
    }
];

export default manualPatches;
