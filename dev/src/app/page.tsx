"use client";
import { useEffect, useRef, useState } from "react";
import { ClientLobbyManager } from "@tk-ch/simple-room-client";
import { LobbyData } from "@tk-ch/simple-room-common";

export default function Home() {
    const [username, setUsername] = useState("");
    const [connected, setConnected] = useState<boolean>(undefined);
    const socketManager = useRef<ClientLobbyManager | undefined>(undefined);
    const [lobbyData, setLobbyData] = useState<LobbyData>({
        users: [],
        host: 0,
    });

    function connect() {
        localStorage.setItem("username", username);
        socketManager.current?.connect({ username });
    }

    function setupSocketManager() {
        const newSocketManager = new ClientLobbyManager({
            sessionStorage: localStorage,
            updateConnectedState: setConnected,
            updateLobbyState: setLobbyData,
        });

        socketManager.current = newSocketManager;
    }

    useEffect(() => {
        if (username == "" && localStorage.getItem("username"))
            setUsername(localStorage.getItem("username"));
    }, [username]);

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
    const users = lobbyData?.users.map((user) => {
        return (
            <li key={user.name}>
                {user.name} {user.ready ? "Ready!" : "Not ready..."}
            </li>
        );
    });
    const userReady = lobbyData?.users.find(
        (user) => user.name === username
    )?.ready;

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
                    <button onClick={() => socketManager.current.ready()}>
                        {userReady ? "Not ready" : "Ready"}
                    </button>
                    {users}
                </>
            )}
        </main>
    );
}
