import React from "react"

export const WebUI = ({ children }: { children: any }) => {
    return (
        <div className={"webui-mount"}>
            {children}
        </div>
    )
}