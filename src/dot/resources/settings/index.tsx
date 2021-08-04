import React from "react";
import { Scrollable } from "../shared/components/Scrollable";
import { WebUI } from "../shared/components/WebUI";
import { webUIRender } from "../shared/mount";
import { SectionRenderer } from "./components/SectionRenderer";
import { Sidebar } from "./components/Sidebar";

export const Settings = webUIRender("settings",
    <WebUI>
        <Sidebar />

        <Scrollable>
            <SectionRenderer />
        </Scrollable>
    </WebUI>
);