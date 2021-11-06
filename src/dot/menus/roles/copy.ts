export const CopyMenuRole = {
    id: "copy",
    label: "Copy",
    icon: "chrome://dot/content/skin/icons/copy.svg",
    type: "normal",
    accelerator: "CmdOrCtrl+C",
    click: () => {
        document.execCommand("copy")
    }
}