import { kRubbishIcon } from "../../core/icons";

export const DeleteMenuRole = {
    id: "delete",
    label: "Delete",
    icon: kRubbishIcon,
    type: "normal",
    click: () => {
        document.execCommand("delete");
    }
};
