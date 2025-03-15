import { ClientSocketManager } from "./clientSocketManager";
import { LobbyData } from "@tk-ch/simple-room-common";
export declare class ClientLobbyManager extends ClientSocketManager {
    isReady: boolean;
    constructor(options: {
        port?: number;
        sessionStorage?: Storage;
        updateConnectedState: (value: boolean) => void;
        updateLobbyState: (value: LobbyData) => void;
    });
    ready(): void;
}
