import { button, createRef, i, RefObject, span, _ } from "oikia";
import { WidgetType } from "./types/item";

class CustomisableUIItem {
    public id: string | undefined;
    public type: WidgetType | undefined;

    public label: string | undefined;
    public labelRef?: RefObject<HTMLSpanElement> | undefined;

    public icon: string | undefined;
    public iconRef?: RefObject<HTMLElement> | undefined;

    public renderAsButton() {
        const hasLabel = this.label && this.label.length;
        const hasIcon = this.icon && this.icon.length;

        if(hasLabel) {
            this.labelRef = createRef<HTMLSpanElement>();
        }

        if(hasIcon) {
            this.iconRef = createRef<HTMLElement>();
        }

        return (
            button({ id: this.id, class: "toolbarbutton" },
                (hasIcon ? i({ 
                    class: "toolbarbutton-icon",
                    ref: this.iconRef,
                    style: {
                        backgroundImage: this.icon
                    }
                }) : _),

                (hasLabel ? span({ 
                    class: "toolbarbutton-label",
                    ref: this.labelRef
                }, this.label) : _),
            )
        );
    }
}

export default CustomisableUIItem;