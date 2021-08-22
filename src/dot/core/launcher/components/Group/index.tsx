import React from "react"

export const Group = ({ id, heading, children }: { id: string, heading: string, children: any }) => {
    return (
        <div className={"launcher-result-group"} id={`launcher-group-${id}`}>
            <h3 className={"launcher-result-group-heading"}>
                {heading}
            </h3>

            <div className={"launcher-result-group-contents"}>
                {children}
            </div>
        </div>
    )
}