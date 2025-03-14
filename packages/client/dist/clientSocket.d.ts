import { Socket } from "socket.io-client";
export interface UserSocket extends Socket {
    sessionID?: string;
    username?: string;
    userID?: string;
}
export declare const getSocket: (port: number) => UserSocket;
