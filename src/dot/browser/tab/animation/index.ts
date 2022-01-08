import Tab from "..";
import { TabOpenAnimation } from "./open";

export class TabAnimations {
    public open = new TabOpenAnimation(this.tab.ref.tab);

    public constructor(public tab: Tab) {}
}
