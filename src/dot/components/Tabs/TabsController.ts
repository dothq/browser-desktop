import React from "react";
import { dot } from "../../api";

export const TabsController = {
    tabsScrollerRef: React.createRef<HTMLDivElement>(),

    tabsScrollerHovering: false,
    tabsScrollerCtrlDown: false,

    get scrollAmount() {
        return dot.prefs.get("dot.tabs.scroll_amount", 250);
    },

    onCtrlDown(event?: KeyboardEvent) {
        this.tabsScrollerCtrlDown = event?.key == "Control" || false;
    },

    onCtrlUp(event?: KeyboardEvent) {
        this.tabsScrollerCtrlDown = !!!(event?.key == "Control");
    },

    onTabsMouseOver() {
        this.tabsScrollerHovering = true;
    },

    onTabsMouseLeave() {
        this.tabsScrollerHovering = false;
    },

    onTabsScroll(event: React.WheelEvent<HTMLDivElement>) {
        TabsController.maybeShowScrollerButtons();

        const scroller = this.tabsScrollerRef.current as HTMLDivElement;

        const direction = event.deltaY < 0 ? "left" : "right"

        if(this.tabsScrollerCtrlDown) {
            const activeIndex = dot.tabs.list.findIndex(x => x.active);
            const active = dot.tabs.list[activeIndex];

            if(active) {
                if(direction == "left") {
                    const previousTab = dot.tabs.list[activeIndex - 1];
                    
                    if(previousTab) {
                        console.log("active", active.url, "prev", previousTab.url);

                        previousTab.select()
                    }
                } else {
                    const nextTab = dot.tabs.list[activeIndex + 1];

                    if(nextTab) {
                        console.log("active", active.url, "next", nextTab.url);

                        nextTab.select()
                    }
                }
            }
        } else {
            let { scrollLeft } = scroller;

            if(direction == "left") {
                // Scroll Left
    
                scrollLeft = scrollLeft - this.scrollAmount;
            } else {
                // Scroll Right
    
                scrollLeft = scrollLeft + this.scrollAmount;
            }
    
            scroller.scrollTo({
                left: scrollLeft,
                top: 0,
                behavior: "smooth"
            });
        }
    },

    scrollToEnd() {
        const scroller = this.tabsScrollerRef.current as HTMLDivElement;

        scroller.scrollTo({
            left: 999999999,
            top: 0,
            behavior: "smooth"
        });
    },

    maybeShowScrollerButtons() {
        const { scrollWidth } = this.tabsScrollerRef.current as HTMLDivElement;

        /*
            We're checking whether the scrollWidth of the
            scroller box is greater than the scrollWidth
            of the body. If it is, we should show the
            scroller buttons.
        */
        dot.window.toggleWindowClass(
            "tabs-scroller-buttons-visible",
            scrollWidth > document.body.scrollWidth
        )
    }
}