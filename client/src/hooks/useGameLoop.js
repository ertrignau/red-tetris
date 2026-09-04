import {
	useEffect,
	useRef
} from "react";

import socket from "../socket/socket.js";

import {
	lockPiece
} from "../game/board.js";

import {
	hasCollision
} from "../game/collision.js";

import {
	clearLines
} from "../game/lines.js";

import {
	calculateScore
} from "../game/scoring.js";

function useGameLoop({
	room,
	started,
	board,
	setBoard,
	currentPiece,
	setCurrentPiece,
	gameOver,
	setGameOver,
	setScore
}) {
	const boardRef =
		useRef(board);

	const currentPieceRef =
		useRef(currentPiece);

	useEffect(() => {
		boardRef.current =
			board;
	}, [board]);

	useEffect(() => {
		currentPieceRef.current =
			currentPiece;
	}, [currentPiece]);

	/*
	 * GAME OVER DETECTION
	 */
	useEffect(() => {
		if (
			!started ||
			!currentPiece ||
			gameOver
		) {
			return;
		}

		if (
			hasCollision(
				board,
				currentPiece
			)
		) {
			console.log(
				"GAME OVER"
			);

			currentPieceRef.current =
				null;

			setCurrentPiece(
				null
			);

			setGameOver(
				true
			);

			socket.emit(
				"player:dead",
				{
					room
				}
			);
		}
	}, [
		room,
		started,
		currentPiece,
		board,
		gameOver,
		setCurrentPiece,
		setGameOver
	]);

	/*
	 * GRAVITY / LOCK
	 */
	useEffect(() => {
		if (
			!started ||
			gameOver
		) {
			return;
		}

		const gravityInterval =
			setInterval(
				() => {
					const piece =
						currentPieceRef.current;

					const currentBoard =
						boardRef.current;

					if (!piece)
						return;

					const nextPosition = {
						...piece,
						y:
							piece.y + 1
					};

					if (
						!hasCollision(
							currentBoard,
							nextPosition
						)
					) {
						currentPieceRef.current =
							nextPosition;

						setCurrentPiece(
							nextPosition
						);

						return;
					}

					const lockedBoard =
						lockPiece(
							currentBoard,
							piece
						);

					const result =
						clearLines(
							lockedBoard
						);

					boardRef.current =
						result.board;

					currentPieceRef.current =
						null;

					setBoard(
						result.board
					);

					setCurrentPiece(
						null
					);

					if (
						result.clearedLines >
						0
					) {
						const gainedScore =
							calculateScore(
								result.clearedLines
							);

						setScore(
							(currentScore) =>
								currentScore +
								gainedScore
						);

						console.log(
							"Lines cleared:",
							result.clearedLines
						);

						/*
						 * Mandatory:
						 *
						 * n cleared lines
						 * => n - 1 penalty lines
						 */
						if (
							result.clearedLines >
							1
						) {
							const penaltyCount =
								result.clearedLines -
								1;

							socket.emit(
								"penalty:send",
								{
									room,
									count:
										penaltyCount
								}
							);

							console.log(
								"Penalty sent:",
								penaltyCount
							);
						}
					}

					socket.emit(
						"piece:next",
						{
							room
						}
					);
				},
				700
			);

		return () => {
			clearInterval(
				gravityInterval
			);
		};
	}, [
		room,
		started,
		gameOver,
		setBoard,
		setCurrentPiece,
		setScore
	]);
}

export default useGameLoop;