import React from "react"

const PAGE_STATUS_SIDE_LEFT = "left";
const PAGE_STATUS_SIDE_RIGHT = "right";

export const PageStatus = () => {
    const [side, setSide] = React.useState(PAGE_STATUS_SIDE_LEFT);

    return (
        <div 
            id={"page-status"}
            className={`page-status-side-${side}`}
            onMouseOver={() => setSide(side == PAGE_STATUS_SIDE_LEFT 
                ? PAGE_STATUS_SIDE_RIGHT 
                : PAGE_STATUS_SIDE_LEFT)}
        >

        </div>
    )
}