export const UndoMenuRole = {
    id: "undo",
    label: "Undo",
    icon: "chrome://dot/content/skin/icons/undo.svg",
    type: "normal",
    accelerator: "CmdOrCtrl+Z",
    click: () => document.execCommand("undo")
}