import {
    EventEmitter,
    EventHandler
} from "@billjs/event-emitter";
import { exportPublic } from "../../shared/globals";

export class ApplicationIPC extends EventEmitter {
    public on(
        type: string,
        handler: EventHandler
    ): boolean {
        return super.on(type, (e) => {
            // console.log("Received event:", e);
            return handler(e);
        });
    }

    public fire(type: string, data?: any): void {
        // console.log("Dispatched event:", { type, data });
        return super.fire(type, data);
    }
}

export const ipc = new ApplicationIPC();
exportPublic("ipc", ipc);
