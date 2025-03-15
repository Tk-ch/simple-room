export interface UserData {
    name: string;
    ready: boolean;
}

export interface LobbyData {
    host: number;
    users: UserData[];
}

export const SOCKET_EVENTS = {
    ready: "ready",
    lobbyUpdate: "update-lobby",
};
