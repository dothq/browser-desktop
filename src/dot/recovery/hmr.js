/*
    HMR is handled outside of any other code so we can continue to
    hot-reload even after the app has crashed or died
*/
class HMRService {
    constructor() {
        try {
            this.socket = new WebSocket(
                "ws://localhost:58423/socket.io"
            );

            this.socket.addEventListener(
                "message",
                (event) => {
                    if (event.type !== "hr") return;

                    window.location.reload();
                }
            );
        } catch (e) {}
    }
}

new HMRService();
