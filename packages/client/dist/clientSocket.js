"use client";
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSocket = void 0;
const socket_io_client_1 = require("socket.io-client");
const URL = (port) => `${window.location.hostname}:${port}`;
const getSocket = (port) => {
    const socket = (0, socket_io_client_1.io)(URL(port), {
        autoConnect: false,
    });
    socket.onAny((event, ...args) => {
        console.log(event, args);
    });
    return socket;
};
exports.getSocket = getSocket;
