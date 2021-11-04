import React from "react";
import { Sidebar as WebUISidebar } from "../../../webui/shared/Sidebar";
import { SidebarItem } from "../../../webui/shared/SidebarItem";
import { sections } from "../../sections";

export const Sidebar = () => {
    return (
        <WebUISidebar title={"Settings"}>
            {sections.map((section) => (
                <SidebarItem
                    id={section.id}
                    text={section.text}
                    icon={section.icon}
                    active={section.visible()}
                />
            ))}
        </WebUISidebar>
    );
};
