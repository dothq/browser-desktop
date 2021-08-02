import React from "react"

export const MiniSearch = ({ placeholder }: { placeholder: string }) => {
    return (
        <div className={"mini-searchbox"}>
            <i className={"mini-searchbox-icon"}></i>
            <input className={"mini-searchbox-input"} type={"text"} placeholder={placeholder}></input>
        </div>
    )
}