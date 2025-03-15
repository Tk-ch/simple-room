export interface UserData {
    name: string;
    ready: boolean;
}
export interface LobbyData {
    host: number;
    users: UserData[];
}
export declare const SOCKET_EVENTS: {
    ready: string;
    lobbyUpdate: string;
};
