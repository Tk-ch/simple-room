var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { EventEmitter } from "events";
import { createServer } from "http";
import { Server } from "socket.io";
import crypto from "crypto";
import { InMemorySessionStore } from "./sessionStore.js";
export const randomId = () => crypto.randomBytes(8).toString("hex");
export class SocketManager {
    constructor(sessionStore = new InMemorySessionStore(), port = 3001) {
        this.emitter = new EventEmitter();
        const server = createServer();
        this.store = sessionStore;
        this.io = new Server(server, { cors: { origin: "*" } });
        this.setup();
        server.listen(port);
    }
    setup() {
        this.io.use((socket, next) => __awaiter(this, void 0, void 0, function* () {
            const sessionID = socket.handshake.auth.sessionID;
            if (sessionID) {
                const session = yield this.store.findSession(sessionID);
                if (session) {
                    socket.sessionID = sessionID;
                    socket.userID = session.userID;
                    socket.username = session.username;
                    return next();
                }
            }
            const username = socket.handshake.auth.username;
            if (!username) {
                return next(new Error("invalid username"));
            }
            socket.sessionID = randomId();
            socket.userID = randomId();
            socket.username = username;
            next();
        }));
        this.io.on("connection", (socket) => {
            if (!socket.sessionID || !socket.userID || !socket.username)
                return;
            this.store.saveSession(socket.sessionID, {
                userID: socket.userID,
                username: socket.username,
                connected: true,
            });
            console.log(this.store);
            socket.emit("session", {
                sessionID: socket.sessionID,
                userID: socket.userID,
            });
            socket.join(socket.userID);
            this.emitter.emit(SOCKET_EVENTS.connected, socket.handshake.auth);
            const actionListener = (action) => {
                this.emitter.emit(SOCKET_EVENTS.action, socket.userID, action);
            };
            socket.on("action", actionListener);
            socket.on("disconnect", () => {
                this.emitter.emit(SOCKET_EVENTS.disconnected, socket.userID);
                socket.off("action", actionListener);
            });
        });
    }
}
export const SOCKET_EVENTS = {
    created: "user-created",
    connected: "user-connected",
    disconnected: "user-disconnected",
    action: "user-action",
};
