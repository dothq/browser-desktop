import React from "react";
import { CSSTransition } from "react-transition-group";

export const PopupDialog = ({
    x,
    y,
    ctx,
    screens,
    initialScreen
}: {
    x: number,
    y: number,
    ctx?: any,
    screens: any,
    initialScreen: any
}) => {
    const [currentScreen, setCurrentScreen] = React.useState(initialScreen);
    const [popupHeight, setPopupHeight] = React.useState(0);

    const onPopupUpdate = (element: HTMLElement) => {
        setPopupHeight(element.offsetHeight);
    }

    return (
        <div className={"ui-popup-dialog"} style={{
            left: `${x}px`,
            top: `${y}px`,
            height: `${popupHeight}px`
        }}>
            {Object.entries(screens)
                .map(([id, Screen]: [any, any]) => (
                    <CSSTransition
                        in={currentScreen == id}
                        timeout={500}
                        classNames={`ui-popup-dialog-screen`}
                        onEnter={onPopupUpdate}
                    >
                        <Screen
                            {...ctx || {}}
                            updateScreen={setCurrentScreen}
                        />
                    </CSSTransition>
                ))
            }
        </div>
    )
}