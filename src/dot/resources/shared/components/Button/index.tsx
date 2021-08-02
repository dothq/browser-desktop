import React from "react"

export const Button = ({ label, icon, primary }: { label?: string, icon?: string, primary?: boolean }) => {
    return (
        <a className={`dot-ui-button ${primary ? `dot-ui-button-primary` : ``}`} href={"#"}>
            {icon && <i
                className={"dot-ui-button-icon"}
                style={{
                    backgroundImage: icon ? `url(${icon})` : ``,
                    marginInlineEnd: (icon && label) ? "10px" : ""
                }}
            ></i>}

            <label className={"dot-ui-button-label"}>
                {label}
            </label>
        </a>
    )
}