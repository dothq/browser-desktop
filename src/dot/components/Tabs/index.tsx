import React from "react"

export const Tabs = ({ children }: { children: any }) => {
    return (
        <div id={"tabbrowser-tabs"}>
            {children}
        </div>
    )
}