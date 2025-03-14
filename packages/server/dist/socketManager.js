"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SOCKET_EVENTS = exports.SocketManager = exports.randomId = void 0;
const events_1 = require("events");
const http_1 = require("http");
const socket_io_1 = require("socket.io");
const crypto_1 = require("crypto");
const sessionStore_js_1 = require("./sessionStore.js");
const randomId = () => (0, crypto_1.randomBytes)(8).toString("hex");
exports.randomId = randomId;
class SocketManager {
    io;
    emitter = new events_1.EventEmitter();
    store;
    constructor(sessionStore = new sessionStore_js_1.InMemorySessionStore(), port = 3001) {
        const server = (0, http_1.createServer)();
        this.store = sessionStore;
        this.io = new socket_io_1.Server(server, { cors: { origin: "*" } });
        this.setup();
        server.listen(port);
    }
    setup() {
        this.io.use(async (socket, next) => {
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
            if (this.store
                .findAllSessions()
                .some((session) => session.user.name === username)) {
                return next(new Error("duplicate username"));
            }
            socket.sessionID = (0, exports.randomId)();
            socket.userID = (0, exports.randomId)();
            socket.username = username;
            next();
        });
        this.io.on("connection", (socket) => {
            if (!socket.sessionID || !socket.userID || !socket.username)
                return;
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
            this.emitter.emit(exports.SOCKET_EVENTS.connected, socket.handshake.auth);
            this.io.emit("update-lobby", {
                users: this.store
                    .findAllSessions()
                    .map((session) => session.user),
                host: 0,
            });
            const actionListener = (action) => {
                this.emitter.emit(exports.SOCKET_EVENTS.action, socket.userID, action);
            };
            const readyListener = (isReady) => {
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
                    if (session)
                        session.connected = false;
                }
                this.emitter.emit(exports.SOCKET_EVENTS.disconnected, socket.userID);
                socket.off("action", actionListener);
                socket.off("ready", readyListener);
            });
        });
    }
}
exports.SocketManager = SocketManager;
exports.SOCKET_EVENTS = {
    created: "user-created",
    connected: "user-connected",
    disconnected: "user-disconnected",
    action: "user-action",
};
