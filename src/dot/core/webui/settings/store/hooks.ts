import { TypedUseSelectorHook, useDispatch, useSelector } from "react-redux"
import type { AppDispatch, RootState } from "."

export const useSettingsDispatch = () => useDispatch<AppDispatch>()
export const useSettingsSelector: TypedUseSelectorHook<RootState> = useSelector