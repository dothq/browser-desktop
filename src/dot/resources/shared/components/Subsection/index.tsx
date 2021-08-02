import React from "react"

export const Subsection = ({ subtitle, children }: { subtitle: string, children?: any }) => {
    return (
        <div className={"webui-subsection"}>
            <h3 className={"webui-subsection-title"}>
                {subtitle}
            </h3>

            <main className={"webui-subsection-container"}>
                {children}
            </main>
        </div>
    )
}