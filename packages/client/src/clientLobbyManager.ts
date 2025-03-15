import { ClientSocketManager } from "./clientSocketManager";
import { SOCKET_EVENTS, LobbyData } from "@tk-ch/simple-room-common";

export class ClientLobbyManager extends ClientSocketManager {
    isReady: boolean = false;

    constructor(options: {
        port?: number;
        sessionStorage?: Storage;
        updateConnectedState: (value: boolean) => void;
        updateLobbyState: (value: LobbyData) => void;
    }) {
        super(options);
        this.socket.on(
            SOCKET_EVENTS.lobbyUpdate,
            (newLobbyManager: LobbyData) => {
                options.updateLobbyState(newLobbyManager);
            }
        );
    }

    ready(): void {
        this.isReady = !this.isReady;
        this.socket.emit(SOCKET_EVENTS.ready, this.isReady);
    }
}
