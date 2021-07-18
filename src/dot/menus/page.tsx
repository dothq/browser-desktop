import React from "react";
import { dot } from "../api";
import { ContextMenu } from "../components/ContextMenu";

export const PageContextMenu = () => (
    <ContextMenu id={"context-navigation"}>
        hello
    </ContextMenu>
)

dot.menu.register({
    id: "context-navigation"
})