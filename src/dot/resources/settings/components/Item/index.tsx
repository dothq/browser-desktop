import React from "react"

export const Item = ({ left, right, children }: { left?: any, right?: any, children?: any }) => {
    return (
        <div className={"settings-item"}>
            <div className={"settings-item-left"}>
                {left}
            </div>

            <div className={"settings-item-right"}>
                {right}
            </div>
        </div>
    )
}