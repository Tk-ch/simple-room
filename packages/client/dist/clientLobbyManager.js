"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClientLobbyManager = void 0;
const clientSocketManager_1 = require("./clientSocketManager");
const simple_room_common_1 = require("@tk-ch/simple-room-common");
class ClientLobbyManager extends clientSocketManager_1.ClientSocketManager {
    isReady = false;
    constructor(options) {
        super(options);
        this.socket.on(simple_room_common_1.SOCKET_EVENTS.lobbyUpdate, (newLobbyManager) => {
            options.updateLobbyState(newLobbyManager);
        });
    }
    ready() {
        this.isReady = !this.isReady;
        this.socket.emit(simple_room_common_1.SOCKET_EVENTS.ready, this.isReady);
    }
}
exports.ClientLobbyManager = ClientLobbyManager;
