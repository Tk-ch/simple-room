import { EventEmitter } from "events";
import { createServer } from "http";
import { Socket, Server } from "socket.io";
import { randomBytes } from "crypto";
import { InMemorySessionStore, SessionStore } from "./sessionStore.js";

export const randomId = () => randomBytes(8).toString("hex");
interface UserSocket extends Socket {
    sessionID?: string;
    username?: string;
    userID?: string;
}

export class SocketManager {
    io: Server;
    emitter: EventEmitter = new EventEmitter();
    store: SessionStore;

    constructor(
        sessionStore: SessionStore = new InMemorySessionStore(),
        port: number = 3001
    ) {
        const server = createServer();
        this.store = sessionStore;
        this.io = new Server(server, { cors: { origin: "*" } });
        this.setup();
        server.listen(port);
    }

    setup() {
        this.io.use(async (socket: UserSocket, next) => {
            const sessionID = socket.handshake.auth.sessionID;
            if (sessionID) {
                const session = await this.store.findSession(sessionID);
                if (session) {
                    socket.sessionID = sessionID;
                    socket.userID = session.userID;
                    socket.username = session.user.name;
                    return next();
                }
            }
            const username = socket.handshake.auth.username;
            if (!username) {
                return next(new Error("invalid username"));
            }
            if (
                this.store
                    .findAllSessions()
                    .some((session) => session.user.name === username)
            ) {
                return next(new Error("duplicate username"));
            }
            socket.sessionID = randomId();
            socket.userID = randomId();
            socket.username = username;
            next();
        });

        this.io.on("connection", (socket: UserSocket) => {
            if (!socket.sessionID || !socket.userID || !socket.username) return;

            if (!this.store.findSession(socket.sessionID)) {
                this.store.saveSession(socket.sessionID, {
                    userID: socket.userID,
                    user: { name: socket.username, ready: false },
                    connected: true,
                });
            }
            socket.emit("session", {
                sessionID: socket.sessionID,
                userID: socket.userID,
            });

            socket.join(socket.userID);

            this.emitter.emit(SOCKET_EVENTS.connected, socket.handshake.auth);

            this.io.emit("update-lobby", {
                users: this.store
                    .findAllSessions()
                    .map((session) => session.user),
                host: 0,
            });

            const actionListener = (action: string) => {
                this.emitter.emit(SOCKET_EVENTS.action, socket.userID, action);
            };

            const readyListener = (isReady: boolean) => {
                if (socket.sessionID) {
                    const session = this.store.findSession(socket.sessionID);
                    if (session) {
                        session.user.ready = isReady;
                        this.io.emit("update-lobby", {
                            users: this.store
                                .findAllSessions()
                                .map((session) => session.user),
                            host: 0,
                        });
                    }
                }
            };

            socket.on("action", actionListener);
            socket.on("ready", readyListener);
            socket.on("disconnect", () => {
                if (socket.sessionID) {
                    const session = this.store.findSession(socket.sessionID);
                    if (session) session.connected = false;
                }
                this.emitter.emit(SOCKET_EVENTS.disconnected, socket.userID);
                socket.off("action", actionListener);
                socket.off("ready", readyListener);
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
