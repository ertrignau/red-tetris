import {
	useCallback
} from "react";

import useSocket
	from "../useSocket.js";

import useGameControls
	from "../keyboard/useGameControls.js";

import useGameLoop
	from "./useGameLoop.js";

import useMultiplayer
	from "../useMultiplayer.js";

import useGameState
	from "./useGameState.js";

import useCountdown
	from "./useCountdown.js";

import useGameSession
	from "./useGameSession.js";

import useRanking
	from "./useRanking.js";

import usePenaltyReceiver
	from "./usePenaltyReceiver.js";

import useGameRestart
	from "./useGameRestart.js";

import useGameActions
	from "./useGameActions.js";

function useGameController(
	room,
	player
) {
	/*
	 * =================================
	 * SOCKET
	 * =================================
	 */
	const {
		playerId,
		roomState,
		error,

		currentPiece,
		setCurrentPiece,

		nextPiece,
		setNextPiece
	} = useSocket(
		room,
		player
	);

	/*
	 * =================================
	 * LOCAL GAME STATE
	 * =================================
	 */
	const {
		board,
		setBoard,

		score,
		setScore,

		gameOver,
		setGameOver,

		resetGameState
	} = useGameState();

	/*
	 * =================================
	 * COUNTDOWN
	 * =================================
	 */
	const {
		countdown,
		gamePlayable,
		setGamePlayable,
		resetCountdown
	} = useCountdown(
		roomState
	);

	/*
	 * =================================
	 * SESSION / REFRESH
	 * =================================
	 */
	const {
		resetSession
	} = useGameSession({
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
	});

	/*
	 * =================================
	 * GAME FINISH CALLBACK
	 * =================================
	 */
	const handleGameFinished =
		useCallback(
			() => {
				setGamePlayable(
					false
				);

				resetSession();
			},
			[
				setGamePlayable,
				resetSession
			]
		);

	/*
	 * =================================
	 * RANKING
	 * =================================
	 */
	const {
		showRanking,
		isFading,
		isFinishing,
		ranking,
		finishedMode,
		resetRanking
	} = useRanking({
		onGameFinished:
			handleGameFinished
	});

	/*
	 * =================================
	 * GAME LOOP
	 * =================================
	 */
	const {
		hardDropCurrentPiece,
		applyPenalty
	} = useGameLoop({
		room,

		started:
			gamePlayable,

		board,
		setBoard,

		currentPiece,
		setCurrentPiece,

		gameOver,
		setGameOver,

		setScore
	});

	/*
	 * =================================
	 * KEYBOARD
	 * =================================
	 */
	useGameControls({
		started:
			gamePlayable,

		gameOver,

		board,

		currentPiece,
		setCurrentPiece,

		onHardDrop:
			hardDropCurrentPiece
	});

	/*
	 * =================================
	 * PENALTIES
	 * =================================
	 */
	usePenaltyReceiver(
		applyPenalty
	);

	/*
	 * =================================
	 * MULTIPLAYER
	 * =================================
	 */
	const {
		opponents
	} = useMultiplayer({
		room,

		started:
			gamePlayable,

		board,

		roomState,

		playerId
	});

	/*
	 * =================================
	 * HOST
	 * =================================
	 */
	const isHost =
		roomState?.hostId ===
		playerId;

	/*
	 * =================================
	 * RESTART / CLIENT RESET
	 * =================================
	 */
	const {
		handleRestart,
		resetClient
	} = useGameRestart({
		room,
		isHost,

		resetGameState,
		resetRanking,
		resetCountdown,
		resetSession,

		setCurrentPiece,
		setNextPiece
	});

	/*
	 * =================================
	 * START / MODE ACTIONS
	 * =================================
	 */
	const {
		handleModeChange,
		handleStart
	} = useGameActions({
		room,
		roomState,
		isHost,
		resetClient
	});

	/*
	 * Keep the final board visible
	 * while the ranking transition
	 * runs or after solo game over.
	 */
	const showBoard =
		Boolean(
			roomState?.started ||
			isFinishing ||
			gameOver
		);

	return {
		/*
		 * Player / room
		 */
		playerId,
		roomState,
		error,
		isHost,

		/*
		 * Gameplay
		 */
		board,
		score,
		gameOver,

		currentPiece,
		nextPiece,

		countdown,
		showBoard,

		/*
		 * Multiplayer
		 */
		opponents,

		/*
		 * Ranking
		 */
		showRanking,
		isFading,
		isFinishing,
		ranking,
		finishedMode,

		/*
		 * Actions
		 */
		handleStart,
		handleModeChange,
		handleRestart
	};
}

export default useGameController;