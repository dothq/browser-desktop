import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import { log } from "..";

export const createWSServer = (): Promise<Server> => {
    return new Promise((resolve) => {
        const app = express();
        const server = createServer(app);
        const io = new Server(server);

        server.listen(58423, () => {
            log.info(
                `Started HMR server at ws://localhost:58423`
            );

            resolve(io);
        });
    });
};
