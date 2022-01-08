import { resolve } from "path";
import { ENGINE_DIR } from "../constants";
import { dispatch } from "../utils";
import { createWSServer } from "../utils/ws";

export const watch = async () => {
    const ws = await createWSServer();

    dispatch(
        "yarn",
        ["watch"],
        resolve(ENGINE_DIR, "dot"),
        false,
        true
    );

    ws.on("connection", (sock) => {
        sock.on("push", (data) => {
            sock.broadcast.emit("hr");
        });
    });
};
