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

export class InMemorySessionStore implements SessionStore {
    sessions: Map<string, Session>;

    constructor() {
        this.sessions = new Map<string, Session>();
    }

    findSession(id: string) {
        return this.sessions.get(id);
    }

    saveSession(id: string, session: Session) {
        this.sessions.set(id, session);
    }

    findAllSessions() {
        return [...this.sessions.values()];
    }
}
