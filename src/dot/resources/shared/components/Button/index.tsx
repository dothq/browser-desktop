import React from "react"

export const Button = ({ label, icon, primary, danger, style, onClick }: { label?: string, icon?: string, primary?: boolean, danger?: boolean, style?: any, onClick?: any }) => {
    return (
        <a className={`dot-ui-button 
            ${primary ? `dot-ui-button-primary` : ``} 
            ${danger ? `dot-ui-button-danger` : ``}
            ${icon && !label ? `just-label` : ``}
        `} href={"#"} style={style} onClick={onClick}>
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