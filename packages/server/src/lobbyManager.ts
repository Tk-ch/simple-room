import { SOCKET_EVENTS } from "@tk-ch/simple-room-common";
import { SocketManager, UserSocket } from "./socketManager";

export class LobbyManager extends SocketManager {
    host: number = 0;

    constructor() {
        super();
    }

    setup() {
        super.setup();
        this.io.on("connection", (socket: UserSocket) => {
            this.io.emit(SOCKET_EVENTS.lobbyUpdate, {
                users: this.store
                    .findAllSessions()
                    .map((session) => session.user),
                host: this.host,
            });

            const readyListener = (isReady: boolean) => {
                if (socket.sessionID) {
                    const session = this.store.findSession(socket.sessionID);
                    if (session) {
                        session.user.ready = isReady;
                        this.io.emit(SOCKET_EVENTS.lobbyUpdate, {
                            users: this.store
                                .findAllSessions()
                                .map((session) => session.user),
                            host: this.host,
                        });
                    }
                }
            };

            socket.on(SOCKET_EVENTS.ready, readyListener);
            socket.on("disconnect", () =>
                socket.off(SOCKET_EVENTS.ready, readyListener)
            );
        });
    }
}
