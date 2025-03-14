export interface UserData {
    name: string;
    ready: boolean;
}
export interface LobbyData {
    host: number;
    users: UserData[];
}
