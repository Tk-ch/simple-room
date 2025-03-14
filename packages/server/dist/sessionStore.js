"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InMemorySessionStore = void 0;
class InMemorySessionStore {
    sessions;
    constructor() {
        this.sessions = new Map();
    }
    findSession(id) {
        return this.sessions.get(id);
    }
    saveSession(id, session) {
        this.sessions.set(id, session);
    }
    findAllSessions() {
        return [...this.sessions.values()];
    }
}
exports.InMemorySessionStore = InMemorySessionStore;
