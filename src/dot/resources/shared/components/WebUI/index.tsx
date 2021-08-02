import React from "react"
import { Provider } from "react-redux"
import { store } from "../../../../app/store"

export const WebUI = ({ children }: { children: any }) => {
    return (
        <Provider store={store}>
            <div className={"webui-mount"}>
                {children}
            </div>
        </Provider>
    )
}