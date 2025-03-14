"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClientSocketManager = void 0;
const clientSocket_1 = require("./clientSocket");
class ClientSocketManager {
    socket;
    constructor(options) {
        this.socket = (0, clientSocket_1.getSocket)(options.port ?? 3001);
        this.socket.on("connect", () => options.updateConnectedState(this.socket.connected));
        this.socket.on("connect_error", () => options.updateConnectedState(this.socket.connected));
        this.socket.on("disconnect", () => options.updateConnectedState(this.socket.connected));
        const sessionID = sessionStorage.getItem("session-id");
        if (sessionID)
            this.connect({ sessionID });
        else
            options.updateConnectedState(false);
        this.socket.on("session", ({ sessionID, userID }) => {
            if (!this.socket)
                return;
            sessionStorage.setItem("session-id", sessionID);
            this.socket.auth = { sessionID };
            this.socket.userID = userID;
        });
    }
    connect(args) {
        this.socket.auth = {
            ...this.socket.auth,
            ...args,
        };
        this.socket.connect();
    }
    destructor() {
        this.socket.off("connect");
        this.socket.off("disconnect");
        this.socket.off("connect_error");
    }
}
exports.ClientSocketManager = ClientSocketManager;
