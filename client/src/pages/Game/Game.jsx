import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import socket from "../../socket/socket.js";

function Game() {
	const { room, player } = useParams();

	const [roomState, setRoomState] = useState(null);
	const [error, setError] = useState(null);
	const [currentPiece, setCurrentPiece] = useState(null);

	useEffect(() => {
		const joinRoom = () => {
			console.log("Joining room:", room, "as", player);

			socket.emit("room:join", {
				room,
				player
			});
		};

		const onRoomState = (state) => {
			console.log("Room state:", state);
			setRoomState(state);
		};

		const onRoomError = (data) => {
			console.log("Room error:", data);
			setError(data.message);
		};

		const onNextPiece = (data) => {
			console.log("Next piece:", data.piece);
			setCurrentPiece(data.piece);
		};

		if (socket.connected) {
			joinRoom();
		}

		socket.on("connect", joinRoom);
		socket.on("room:state", onRoomState);
		socket.on("room:error", onRoomError);
		socket.on("piece:next", onNextPiece);

		return () => {
			socket.off("connect", joinRoom);
			socket.off("room:state", onRoomState);
			socket.off("room:error", onRoomError);
			socket.off("piece:next", onNextPiece);
		};
	}, [room, player]);

	useEffect(() => {
		if (!roomState?.started)
			return;

		socket.emit("piece:next", {
			room
		});
	}, [roomState?.started, room]);

	const currentPlayer = roomState?.players.find(
		(p) => p.name === player
	);

	const isHost = currentPlayer?.isHost === true;

	const handleStart = () => {
		socket.emit("game:start", {
			room
		});
	};

	return (
		<main>
			<h1>Red Tetris</h1>

			<p>Room: {room}</p>
			<p>Player: {player}</p>

			{error && (
				<p>{error}</p>
			)}

			<h2>Players</h2>

			{roomState ? (
				<ul>
					{roomState.players.map((p) => (
						<li key={p.name}>
							{p.name}
							{p.isHost ? " [HOST]" : ""}
						</li>
					))}
				</ul>
			) : (
				<p>Loading room...</p>
			)}

			{isHost && !roomState?.started && (
				<button onClick={handleStart}>
					Start game
				</button>
			)}

			{roomState?.started && (
				<>
					<p>Game started</p>

					{currentPiece && (
						<p>Current piece: {currentPiece}</p>
					)}
				</>
			)}
		</main>
	);
}

export default Game;