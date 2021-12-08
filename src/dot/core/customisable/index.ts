import { exportPublic } from "../../shared/globals";
import { CustomisableUIWidgetData } from "./types/widget";

class CustomisableUIWidget {
    public id: string;

    public constructor(id: string, data: CustomisableUIWidgetData) {
        this.id = id;

        this.registerEvents();
    }

    public registerEvents() {
        const prototype = (this as any).prototype as Partial<CustomisableUIWidget>;
        const props = Object.getOwnPropertyNames(prototype);

        const eventPrefixedProps = props.filter(p => {
            return (
                p.startsWith("on") && 
                p.charAt(2) == p.charAt(2).toUpperCase()
            )
        })

        for(const prop of eventPrefixedProps) {
            console.log("registered event", prop);
        }
    }
}

class CustomisableUI {
    public Widget = CustomisableUIWidget;
}

const singleton = new CustomisableUI();

export default singleton;
exportPublic("CustomisableUI", singleton);