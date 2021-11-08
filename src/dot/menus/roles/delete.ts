export const DeleteMenuRole = {
    id: "delete",
    label: "Delete",
    icon: "chrome://dot/content/skin/icons/rubbish.svg",
    type: "normal",
    click: () => {
        document.execCommand("delete");
    }
};
