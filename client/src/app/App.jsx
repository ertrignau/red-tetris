import { useEffect, useState } from "react";
import socket from "../socket/socket.js";

function App() {
    const [connected, setConnected] = useState(socket.connected);

    useEffect(() => {
        const onConnect = () => {
            console.log("Connected:", socket.id);
            setConnected(true);

			socket.emit("ping:test", {
				message: "hello server"
			});
        };

        const onDisconnect = () => {
            console.log("Disconnected");
            setConnected(false);
        };

		const onPong = (data) => {
			console.log("Server response:", data);
		};

        socket.on("connect", onConnect);
        socket.on("disconnect", onDisconnect);
		socket.on("pong:test", onPong);

        return () => {
            socket.off("connect", onConnect);
            socket.off("disconnect", onDisconnect);
			socket.off("pong:test", onPong);
        };
    }, []);

    return (
        <main>
            <h1>Red Tetris</h1>
            <p>
                Socket: {connected ? "connected" : "disconnected"}
            </p>
        </main>
    );
}

export default App;