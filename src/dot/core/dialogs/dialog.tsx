import React from "react";
import { CSSTransition } from "react-transition-group";

export const PopupDialog = ({
    x,
    y,
    ctx,
    screens,
    initialScreen
}: {
    x: number;
    y: number;
    ctx?: any;
    screens: any;
    initialScreen: any;
}) => {
    const [currentScreen, setCurrentScreen] =
        React.useState(initialScreen);
    // Note that react assumes that numbers are pixel values, so there is no good
    // reason to add px to the end of height at any time
    const [popupHeight, setPopupHeight] = React.useState<
        string | number
    >("auto");

    const onPopupUpdate = (element: HTMLElement) => {
        setPopupHeight(element.offsetHeight);
    };

    return (
        <div
            className={"ui-popup-dialog"}
            style={{
                left: `${x}px`,
                top: `${y}px`,
                height: popupHeight
            }}
        >
            {Object.entries(screens).map(
                ([id, Screen]: [any, any]) => (
                    <CSSTransition
                        in={currentScreen == id}
                        timeout={500}
                        classNames={`ui-popup-dialog-screen`}
                        onEnter={onPopupUpdate}
                    >
                        <Screen
                            {...(ctx || {})}
                            updateScreen={
                                setCurrentScreen
                            }
                        />
                    </CSSTransition>
                )
            )}
        </div>
    );
};
