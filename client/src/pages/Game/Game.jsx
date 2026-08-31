import { useEffect } from "react";
import { useParams } from "react-router-dom";

import socket from "../../socket/socket.js";

function Game() {
	const { room, player } = useParams();

	useEffect(() => {
		const joinRoom = () => {
			console.log("Joining room:", room, "as", player);

			socket.emit("room:join", {
				room,
				player
			});
		};

		if (socket.connected) {
			joinRoom();
		}

		socket.on("connect", joinRoom);

		return () => {
			socket.off("connect", joinRoom);
		};
	}, [room, player]);

	return (
		<main>
			<h1>Red Tetris</h1>

			<p>Room: {room}</p>
			<p>Player: {player}</p>
		</main>
	);
}

export default Game;