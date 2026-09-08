import {
	useCallback,
	useEffect,
	useRef
} from "react";

import socket
	from "../../socket/socket.js";

import {
	lockPiece
} from "../../game/board.js";

import {
	hasCollision
} from "../../game/collision.js";

import {
	hardDrop
} from "../../game/drop.js";

import {
	clearLines
} from "../../game/lines.js";

import {
	calculateScore
} from "../../game/scoring.js";

import {
	addPenaltyLines
} from "../../game/penalty.js";

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
	 * Lock a piece.
	 *
	 * Used both by gravity
	 * and hard drop.
	 */
	const lockCurrentPiece =
		useCallback(
			(piece) => {
				if (
					!piece ||
					gameOver
				) {
					return;
				}

				const currentBoard =
					boardRef.current;

				/*
				 * Remove active piece
				 * immediately so no input
				 * can move it after lock.
				 */
				currentPieceRef.current =
					null;

				setCurrentPiece(
					null
				);

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

				setBoard(
					result.board
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
						(currentScore) => {
							const nextScore =
								currentScore +
								gainedScore;

							socket.emit(
								"score:update",
								{
									room,
									score:
										nextScore
								}
							);

							return nextScore;
						}
					);

					console.log(
						"Lines cleared:",
						result.clearedLines
					);

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
			[
				room,
				gameOver,
				setBoard,
				setCurrentPiece,
				setScore
			]
		);

	/*
	 * HARD DROP
	 */
	const hardDropCurrentPiece =
		useCallback(
			() => {
				if (
					!started ||
					gameOver
				) {
					return;
				}

				const piece =
					currentPieceRef.current;

				if (!piece)
					return;

				const droppedPiece =
					hardDrop(
						boardRef.current,
						piece
					);

				lockCurrentPiece(
					droppedPiece
				);
			},
			[
				started,
				gameOver,
				lockCurrentPiece
			]
		);

	/*
	 * RECEIVE PENALTY.
	 *
	 * Garbage lines push the board
	 * upward.
	 *
	 * The currently falling piece
	 * must therefore be pushed
	 * upward by the same amount,
	 * otherwise the board can move
	 * inside the piece and create a
	 * false collision / game over.
	 */
	const applyPenalty =
		useCallback(
			(count) => {
				if (
					!started ||
					gameOver
				) {
					return;
				}

				const penaltyCount =
					Math.max(
						0,
						Math.floor(
							Number(
								count
							) || 0
						)
					);

				if (
					penaltyCount ===
					0
				) {
					return;
				}

				const currentBoard =
					boardRef.current;

				const nextBoard =
					addPenaltyLines(
						currentBoard,
						penaltyCount
					);

				/*
				 * Update the ref first.
				 *
				 * Gravity always sees the
				 * new board immediately.
				 */
				boardRef.current =
					nextBoard;

				setBoard(
					nextBoard
				);

				const piece =
					currentPieceRef.current;

				if (!piece)
					return;

				/*
				 * Board moved up by N rows,
				 * therefore active piece
				 * moves up by N rows too.
				 */
				const shiftedPiece = {
					...piece,

					y:
						piece.y -
						penaltyCount
				};

				currentPieceRef.current =
					shiftedPiece;

				setCurrentPiece(
					shiftedPiece
				);

				console.log(
					"Penalty applied:",
					penaltyCount
				);
			},
			[
				started,
				gameOver,
				setBoard,
				setCurrentPiece
			]
		);

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
	 * GRAVITY
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

					lockCurrentPiece(
						piece
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
		started,
		gameOver,
		lockCurrentPiece,
		setCurrentPiece
	]);

	return {
		hardDropCurrentPiece,
		applyPenalty
	};
}

export default useGameLoop;