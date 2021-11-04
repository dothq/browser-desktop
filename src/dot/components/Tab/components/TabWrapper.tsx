import React from "react";

interface Props {
    children: React.ReactChild;
}

export const TabWrapper = ({ children }: Props) => {
    return (
        <div className={"tabbrowser-tab-wrapper"}>
            {children}
        </div>
    );
};
