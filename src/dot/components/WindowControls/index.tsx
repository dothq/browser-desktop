import React from "react";
import { dot } from "../../app";
import { CloseButton, MaximiseButton, MinimiseButton, WindowControlsContainer } from "./style";

export const WindowControls = () => (
    <WindowControlsContainer>
        <MinimiseButton onClick={() => dot.window.minimise()} />
        <MaximiseButton onClick={() => dot.window.maximise()} />
        <CloseButton onClick={() => dot.window.quit()} />
    </WindowControlsContainer>
)