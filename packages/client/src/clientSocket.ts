"use client";
import { io, Socket } from "socket.io-client";

export interface UserSocket extends Socket {
    sessionID?: string;
    username?: string;
    userID?: string;
}

const URL = (port: number) => `${window.location.hostname}:${port}`;
export const getSocket = (port: number) => {
    const socket = io(URL(port), {
        autoConnect: false,
    });
    socket.onAny((event, ...args) => {
        console.log(event, args);
    });
    return socket as UserSocket;
};
