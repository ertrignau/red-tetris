import {
	useEffect,
	useState
} from "react";

import socket from "../socket/socket.js";

import {
	createPiece
} from "../game/pieces.js";

import {
	getPlayerId
} from "../utils/playerIdentity.js";

function useSocket(
	room,
	player
) {
	const [
		roomState,
		setRoomState
	] = useState(null);

	const [
		error,
		setError
	] = useState(null);

	const [
		currentPiece,
		setCurrentPiece
	] = useState(null);

	const [
		nextPiece,
		setNextPiece
	] = useState(null);

	/*
	 * Stable identifier for
	 * this browser tab.
	 */
	const [
		playerId
	] = useState(
		() => getPlayerId()
	);

	useEffect(() => {
		const joinRoom =
			() => {
				console.log(
					"Joining room:",
					room,
					"as",
					player,
					"playerId:",
					playerId
				);

				socket.emit(
					"room:join",
					{
						room,
						player,
						playerId
					}
				);
			};

		const onRoomState =
			(state) => {
				console.log(
					"Room state:",
					state
				);

				setRoomState(
					state
				);

				setError(
					null
				);
			};

		const onRoomError =
			(data) => {
				console.log(
					"Room error:",
					data
				);

				setError(
					data.message
				);
			};

		const onNextPiece =
			(data) => {
				setCurrentPiece(
					createPiece(
						data.piece
					)
				);

				if (
					data.nextPiece
				) {
					setNextPiece(
						createPiece(
							data.nextPiece
						)
					);
				} else {
					setNextPiece(
						null
					);
				}
			};

		if (
			socket.connected
		) {
			joinRoom();
		}

		socket.on(
			"connect",
			joinRoom
		);

		socket.on(
			"room:state",
			onRoomState
		);

		socket.on(
			"room:error",
			onRoomError
		);

		socket.on(
			"piece:next",
			onNextPiece
		);

		return () => {
			socket.off(
				"connect",
				joinRoom
			);

			socket.off(
				"room:state",
				onRoomState
			);

			socket.off(
				"room:error",
				onRoomError
			);

			socket.off(
				"piece:next",
				onNextPiece
			);
		};
	}, [
		room,
		player,
		playerId
	]);

	/*
	 * IMPORTANT:
	 *
	 * We do NOT automatically request
	 * a piece when roomState.started
	 * becomes true.
	 *
	 * Game.jsx decides if we must:
	 * - restore a saved session
	 * - or request the first piece
	 *
	 * This prevents refresh from
	 * consuming an extra server piece.
	 */

	return {
		playerId,

		roomState,

		error,

		currentPiece,
		setCurrentPiece,

		nextPiece,
		setNextPiece
	};
}

export default useSocket;