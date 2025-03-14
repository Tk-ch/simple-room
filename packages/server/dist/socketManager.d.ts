import { EventEmitter } from "events";
import { Server } from "socket.io";
import { SessionStore } from "./sessionStore.js";
export declare const randomId: () => string;
export declare class SocketManager {
    io: Server;
    emitter: EventEmitter;
    store: SessionStore;
    constructor(sessionStore?: SessionStore, port?: number);
    setup(): void;
}
export declare const SOCKET_EVENTS: {
    created: string;
    connected: string;
    disconnected: string;
    action: string;
};
