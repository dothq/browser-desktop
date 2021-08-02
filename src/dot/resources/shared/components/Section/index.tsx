import React from "react"

export const Section = ({ title, children }: { title: string; children?: any }) => {
    return (
        <section className={"webui-section"}>
            <h1 className={"webui-section-title"}>{title}</h1>

            {children}
        </section>
    )
}