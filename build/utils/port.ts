import { createServer } from "net";

export const portInUse = (port: number) => {
    return new Promise((resolve) => {
        const server = createServer((socket)=> {
            socket.write("\r\n");
            socket.pipe(socket);
        });
    
        server.listen(port, "127.0.0.1");
    
        server.once("error", () => resolve(true));
        server.once("listening", () => {
            server.close();
            resolve(false);
        })
    })
}