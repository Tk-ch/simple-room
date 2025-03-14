import { UserData } from "@tk-ch/simple-room-common";
export interface SessionStore {
    findSession(id: string): Session | undefined;
    saveSession(id: string, session: Session): void;
    findAllSessions(): Session[];
}
interface Session {
    userID: string;
    user: UserData;
    connected: boolean;
}
export declare class InMemorySessionStore implements SessionStore {
    sessions: Map<string, Session>;
    constructor();
    findSession(id: string): Session | undefined;
    saveSession(id: string, session: Session): void;
    findAllSessions(): Session[];
}
export {};
