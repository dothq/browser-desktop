import { dot } from "../../api"

export const WindowControls = () => {
    return (
        <div class="titlebar-buttonbox-container">
            <div class="titlebar-buttonbox titlebar-color">
                <a
                    class="titlebar-button titlebar-min"
                    onClick={() => dot.window.minimise()}
                ></a>
                <a
                    class="titlebar-button titlebar-max"
                    onClick={() => dot.window.maximise()}
                ></a>
                <a
                    class="titlebar-button titlebar-close"
                    onClick={() => dot.window.quit()}
                ></a>
            </div>
        </div>
    )
}