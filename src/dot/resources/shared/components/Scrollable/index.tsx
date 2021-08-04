import React from "react"

export const Scrollable = ({ children }: { children?: any }) => {
    return (
        <div className={"webui-scrollable"}>
            {children}
        </div>
    )
}