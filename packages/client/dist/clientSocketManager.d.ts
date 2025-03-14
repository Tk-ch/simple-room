import { UserSocket } from "./clientSocket";
export declare class ClientSocketManager {
    socket: UserSocket;
    constructor(options: {
        port?: number;
        sessionStorage?: Storage;
        updateConnectedState: (value: boolean) => void;
    });
    connect(args: {
        username?: string;
        sessionID?: string;
    }): void;
    destructor(): void;
}
