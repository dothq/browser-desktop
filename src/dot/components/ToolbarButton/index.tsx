import { dot } from "../../api";

export const ToolbarButton = ({
    image,
    children,
    id,
    onClick,
    command,
    className,
    disabled
}: {
    image?: string
    children?: any
    id?: any
    onClick?: any
    command?: string
    className?: any
    disabled?: boolean
}) => {
    return (
        <a 
            id={id} 
            className={`
                toolbar-button
                ${disabled ? `toolbar-button-disabled` : ``}
                ${!!image ? `toolbar-button-has-image` : ``}
                ${className ? className : ``}
            `.trim()}
            onClick={command ? () => dot.utilities.doCommand(command) : onClick}
        >
            <i className={"toolbarbutton-icon"} style={{ "background-image": `url(${image})` }} />

            <label className={"toolbarbutton-text"}>
                {children}
            </label>
        </a>
    )
};