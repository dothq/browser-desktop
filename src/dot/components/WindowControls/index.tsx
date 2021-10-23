import { observer } from "mobx-react";
import React from "react";
import { dot } from "../../api";

export const WindowControls = observer(() => {
    return (
        <div className="titlebar-buttonbox-container">
            <div className="titlebar-buttonbox titlebar-color">
                <a
                    className="titlebar-button titlebar-min"
                    onClick={() => dot.window.minimise()}
                ></a>
                <a
                    className="titlebar-button titlebar-max"
                    onClick={() => dot.window.maximise()}
                ></a>
                <a
                    className="titlebar-button titlebar-close"
                    onClick={() => dot.window.quit()}
                ></a>
            </div>
        </div>
    );
});