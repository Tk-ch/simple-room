"use client";
import { useEffect, useRef, useState } from "react";
import { ClientSocketManager } from "@tk-ch/simple-room-client";
import { LobbyData } from "@tk-ch/simple-room-common";

export default function Home() {
    const [username, setUsername] = useState("");
    const [connected, setConnected] = useState<boolean>(undefined);
    const socketManager = useRef<ClientSocketManager | undefined>(undefined);
    const [lobbyManager, setLobbyManager] = useState<LobbyData>({
        users: [],
        host: 0,
    });

    function connect() {
        localStorage.setItem("username", username);
        socketManager.current?.connect({ username });
    }

    function ready() {
        socketManager.current.socket.emit("ready", true);
    }

    function setupSocketManager() {
        const newSocketManager = new ClientSocketManager({
            sessionStorage: localStorage,
            updateConnectedState: (value) => setConnected(value),
        });

        newSocketManager.socket.on(
            "update-lobby",
            (newLobbyManager: LobbyData) => {
                setLobbyManager(newLobbyManager);
            }
        );

        socketManager.current = newSocketManager;
    }

    useEffect(() => {
        if (!socketManager.current) {
            setupSocketManager();
        }

        window.addEventListener("beforeunload", () => {
            socketManager.current.destructor();
        });

        return () => {
            socketManager.current.destructor();
        };
    }, []);

    const triedConnecting = !(connected === undefined);
    const users = lobbyManager?.users.map((user) => {
        return (
            <li key={user.name}>
                {user.name} {user.ready ? "Ready!" : "Not ready..."}
            </li>
        );
    });

    return (
        <main>
            {triedConnecting && !connected && (
                <>
                    <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                    />
                    <button onClick={connect}>Connect</button>
                </>
            )}
            {triedConnecting && connected && (
                <>
                    Connected!
                    <br />
                    <button onClick={ready}>Ready!</button>
                    {users}
                </>
            )}
        </main>
    );
}
