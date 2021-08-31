import React from "react"

export const PopupContainer = ({ children, x, y }: { children?: any, x: number, y: number }) => {
    return (
        <div className={"ui-popup-dialog"} style={{
            left: `${x}px`,
            top: `${y}px`
        }}>
            {children}
        </div>
    )
}

export const PopupHeader = ({ title }: { title: string }) => {
    return (
        <main className={"ui-popup-dialog-header"}>
            <h1 className={"ui-popup-dialog-header-title"}>{title}</h1>
        </main>
    )
}

export const PopupScreen = ({ title, children }: { title: string, children?: any }) => {
    return (
        <>
            <PopupHeader title={title} />

            {children}
        </>
    )
}

export const PopupItem = ({ icon, title, subtitle }: { icon?: string, title: string, subtitle?: string }) => {
    return (
        <a className={"ui-popup-dialog-item"}>
            <i
                className={"ui-popup-dialog-item-icon"}
                style={{
                    backgroundImage: `url(chrome://dot/content/skin/icons/${icon}.svg)`
                }}
            ></i>

            <div className={"ui-popup-dialog-item-titles"}>
                <h1 className={"ui-popup-dialog-item-title"}>
                    {title}
                </h1>

                {subtitle && <span className={"ui-popup-dialog-item-subtitle"}>
                    {subtitle}
                </span>}
            </div>
        </a>
    )
}