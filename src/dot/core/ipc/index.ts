import { EventEmitter } from "@billjs/event-emitter";
import { exportPublic } from "../../shared/globals";

export class ApplicationIPC extends EventEmitter { };

export const ipc = new ApplicationIPC();
exportPublic("ipc", ipc);