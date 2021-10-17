import React from "react";

export const TabContainer = (props: React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement>) => {
    return (
        <div 
            className={"tabbrowser-tab"}
            {...props}
        >
            {props.children}
        </div>
    )
}