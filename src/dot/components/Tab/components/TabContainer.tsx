import React from "react";

export const TabContainer = (
    props: any
) => {
    return (
        <div className={"tabbrowser-tab"} {...props}>
            {props.children}
        </div>
    );
};
