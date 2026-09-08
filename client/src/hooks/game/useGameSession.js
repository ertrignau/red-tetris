import {
	useCallback,
	useEffect,
	useRef,
	useState
} from "react";

import socket from "../../socket/socket.js";

import {
	createBoard
} from "../../game/board.js";

import {
	clearGameSession,
	loadGameSession,
	saveGameSession
} from "../../utils/gameSession.js";

function useGameSession({
	room,
	playerId,
	roomState,

	board,
	setBoard,

	score,
	setScore,

	gameOver,
	setGameOver,

	currentPiece,
	setCurrentPiece,

	nextPiece,
	setNextPiece
}) {
	const [
		sessionReady,
		setSessionReady
	] = useState(false);

	const initializedRoundRef =
		useRef(null);

	const resetSession =
		useCallback(
			() => {
				setSessionReady(
					false
				);

				initializedRoundRef.current =
					null;

				clearGameSession(
					room,
					playerId
				);
			},
			[
				room,
				playerId
			]
		);

	/*
	 * Restore an existing round or
	 * initialize a new one.
	 */
	useEffect(() => {
		if (
			!roomState?.started ||
			roomState?.roundId ===
				undefined ||
			roomState?.roundId ===
				null
		) {
			initializedRoundRef.current =
				null;

			setSessionReady(
				false
			);

			return;
		}

		const roundId =
			roomState.roundId;

		/*
		 * Prevent StrictMode from
		 * initializing twice.
		 */
		if (
			initializedRoundRef.current ===
			roundId
		) {
			return;
		}

		initializedRoundRef.current =
			roundId;

		const savedSession =
			loadGameSession(
				room,
				playerId
			);

		/*
		 * Refresh / reconnect.
		 */
		if (
			savedSession &&
			savedSession.roundId ===
				roundId
		) {
			console.log(
				"Restoring game session:",
				roundId
			);

			setBoard(
				savedSession.board ??
					createBoard()
			);

			setScore(
				savedSession.score ??
					0
			);

			setGameOver(
				Boolean(
					savedSession.gameOver
				)
			);

			setCurrentPiece(
				savedSession.currentPiece ??
					null
			);

			setNextPiece(
				savedSession.nextPiece ??
					null
			);

			setSessionReady(
				true
			);

			return;
		}

		/*
		 * New round.
		 */
		console.log(
			"Initializing new round:",
			roundId
		);

		setBoard(
			createBoard()
		);

		setScore(
			0
		);

		setGameOver(
			false
		);

		setCurrentPiece(
			null
		);

		setNextPiece(
			null
		);

		clearGameSession(
			room,
			playerId
		);

		setSessionReady(
			true
		);

		socket.emit(
			"piece:next",
			{
				room
			}
		);
	}, [
		room,
		playerId,
		roomState?.started,
		roomState?.roundId,
		setBoard,
		setScore,
		setGameOver,
		setCurrentPiece,
		setNextPiece
	]);

	/*
	 * Save the current round for
	 * refresh/reconnect.
	 */
	useEffect(() => {
		if (
			!roomState?.started ||
			!sessionReady ||
			roomState?.roundId ===
				undefined ||
			roomState?.roundId ===
				null
		) {
			return;
		}

		/*
		 * Do not overwrite the snapshot
		 * with the brief empty state
		 * before the first piece arrives.
		 */
		if (
			!currentPiece &&
			!gameOver
		) {
			return;
		}

		saveGameSession(
			room,
			playerId,
			{
				roundId:
					roomState.roundId,

				board,

				score,

				currentPiece,

				nextPiece,

				gameOver
			}
		);
	}, [
		room,
		playerId,
		roomState?.started,
		roomState?.roundId,
		sessionReady,
		board,
		score,
		currentPiece,
		nextPiece,
		gameOver
	]);

	return {
		sessionReady,
		resetSession
	};
}

export default useGameSession;