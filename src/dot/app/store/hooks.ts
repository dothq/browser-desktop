import {
    TypedUseSelectorHook,
    useDispatch,
    useSelector
} from "react-redux";
import type { AppDispatch, RootState } from ".";

export const useBrowserDispatch = () =>
    useDispatch<AppDispatch>();
export const useBrowserSelector: TypedUseSelectorHook<RootState> =
    useSelector;
