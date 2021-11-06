export const CutMenuRole = {
    id: "cut",
    label: "Cut",
    icon: "chrome://dot/content/skin/icons/cut.svg",
    type: "normal",
    accelerator: "CmdOrCtrl+X",
    click: () => {
        document.execCommand("cut")
    }
}