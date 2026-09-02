import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import socket from "../../socket/socket.js";

import Board from "../../components/Board/Board.jsx";
import PiecePreview from "../../components/PiecePreview/PiecePreview.jsx";

import {
	createBoard,
	lockPiece
} from "../../game/board.js";

import { createPiece } from "../../game/pieces.js";

import {
	moveLeft,
	moveRight,
	moveDown
} from "../../game/movement.js";

import { hardDrop } from "../../game/drop.js";
import { rotatePiece } from "../../game/rotation.js";
import { hasCollision } from "../../game/collision.js";
import { clearLines } from "../../game/lines.js";
import { calculateScore } from "../../game/scoring.js";

function Game() {
	const { room, player } = useParams();

	const [board, setBoard] =
		useState(() => createBoard());

	const [roomState, setRoomState] =
		useState(null);

	const [error, setError] =
		useState(null);

	const [currentPiece, setCurrentPiece] =
		useState(null);

	const [nextPiece, setNextPiece] =
		useState(null);

	const [score, setScore] =
		useState(0);

	const [gameOver, setGameOver] =
		useState(false);

	useEffect(() => {
		const joinRoom = () => {
			console.log(
				"Joining room:",
				room,
				"as",
				player
			);

			socket.emit("room:join", {
				room,
				player
			});
		};

		const onRoomState = (state) => {
			console.log(
				"Room state:",
				state
			);

			setRoomState(state);
		};

		const onRoomError = (data) => {
			console.log(
				"Room error:",
				data
			);

			setError(data.message);
		};

		const onNextPiece = (data) => {
			console.log(
				"Current piece:",
				data.piece,
				"Next piece:",
				data.nextPiece
			);

			const piece =
				createPiece(data.piece);

			setCurrentPiece(piece);

			if (data.nextPiece) {
				setNextPiece(
					createPiece(
						data.nextPiece
					)
				);
			} else {
				setNextPiece(null);
			}
		};

		if (socket.connected)
			joinRoom();

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
	}, [room, player]);

	useEffect(() => {
		if (!roomState?.started)
			return;

		socket.emit(
			"piece:next",
			{
				room
			}
		);
	}, [
		roomState?.started,
		room
	]);

	useEffect(() => {
		if (
			!roomState?.started ||
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

			setGameOver(true);
			setCurrentPiece(null);
		}
	}, [
		roomState?.started,
		currentPiece,
		board,
		gameOver
	]);

	useEffect(() => {
		if (
			!roomState?.started ||
			!currentPiece ||
			gameOver
		) {
			return;
		}

		const handleKeyDown = (event) => {
			switch (event.code) {
				case "ArrowLeft":
					event.preventDefault();

					setCurrentPiece(
						(piece) => {
							if (!piece)
								return piece;

							return moveLeft(
								board,
								piece
							);
						}
					);

					break;

				case "ArrowRight":
					event.preventDefault();

					setCurrentPiece(
						(piece) => {
							if (!piece)
								return piece;

							return moveRight(
								board,
								piece
							);
						}
					);

					break;

				case "ArrowDown":
					event.preventDefault();

					setCurrentPiece(
						(piece) => {
							if (!piece)
								return piece;

							return moveDown(
								board,
								piece
							);
						}
					);

					break;

				case "ArrowUp":
					event.preventDefault();

					setCurrentPiece(
						(piece) => {
							if (!piece)
								return piece;

							return rotatePiece(
								board,
								piece
							);
						}
					);

					break;

				case "Space":
					event.preventDefault();

					setCurrentPiece(
						(piece) => {
							if (!piece)
								return piece;

							return hardDrop(
								board,
								piece
							);
						}
					);

					break;

				default:
					break;
			}
		};

		window.addEventListener(
			"keydown",
			handleKeyDown
		);

		return () => {
			window.removeEventListener(
				"keydown",
				handleKeyDown
			);
		};
	}, [
		roomState?.started,
		currentPiece,
		board,
		gameOver
	]);

	useEffect(() => {
		if (
			!roomState?.started ||
			!currentPiece ||
			gameOver
		) {
			return;
		}

		const gravityInterval =
			setInterval(() => {
				setCurrentPiece(
					(piece) => {
						if (!piece)
							return piece;

						const nextPosition = {
							...piece,
							y:
								piece.y +
								1
						};

						if (
							hasCollision(
								board,
								nextPosition
							)
						) {
							setBoard(
								(
									currentBoard
								) => {
									const lockedBoard =
										lockPiece(
											currentBoard,
											piece
										);

									const result =
										clearLines(
											lockedBoard
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
											(
												currentScore
											) =>
												currentScore +
												gainedScore
										);

										console.log(
											"Lines cleared:",
											result.clearedLines
										);

										console.log(
											"Score gained:",
											gainedScore
										);
									}

									return result.board;
								}
							);

							socket.emit(
								"piece:next",
								{
									room
								}
							);

							return null;
						}

						return nextPosition;
					}
				);
			}, 700);

		return () => {
			clearInterval(
				gravityInterval
			);
		};
	}, [
		roomState?.started,
		currentPiece,
		board,
		room,
		gameOver
	]);

	const currentPlayer =
		roomState?.players.find(
			(p) => p.name === player
		);

	const isHost =
		currentPlayer?.isHost === true;

	const handleStart = () => {
		socket.emit(
			"game:start",
			{
				room
			}
		);
	};

	return (
		<main className="game-page">
			<header className="game-header">
				<h1 className="game-title">
					<span>RED</span>{" "}
					TETRIS
				</h1>

				<div className="room-badge">
					ROOM //{" "}
					{room.toUpperCase()}
				</div>
			</header>

			<div className="game-layout">
				<aside className="game-panel players-panel">
					<div className="panel-header">
						<span className="panel-dot"></span>

						<h2>
							Players
						</h2>
					</div>

					<div className="current-player">
						<span className="current-player-label">
							YOU
						</span>

						<strong>
							{player}
						</strong>
					</div>

					{error && (
						<div className="game-error">
							{error}
						</div>
					)}

					{roomState ? (
						<ul className="player-list">
							{roomState.players.map(
								(p) => (
									<li
										key={
											p.name
										}
										className={
											p.name ===
											player
												? "player active-player"
												: "player"
										}
									>
										<div className="player-avatar">
											{p.name
												.charAt(
													0
												)
												.toUpperCase()}
										</div>

										<span className="player-name">
											{
												p.name
											}
										</span>

										{p.isHost && (
											<span className="host-badge">
												HOST
											</span>
										)}
									</li>
								)
							)}
						</ul>
					) : (
						<p className="muted">
							Loading players...
						</p>
					)}

					{isHost &&
						!roomState?.started && (
							<button
								className="start-button"
								onClick={
									handleStart
								}
							>
								START GAME
							</button>
						)}
				</aside>

				<section className="board-section">
					<div className="game-status">
						<span
							className={
								gameOver
									? "status-light game-over-light"
									: roomState?.started
										? "status-light online"
										: "status-light"
							}
						></span>

						{gameOver
							? "GAME OVER"
							: roomState?.started
								? "GAME IN PROGRESS"
								: "WAITING FOR HOST"}
					</div>

					<div className="board-frame">
						{roomState?.started ? (
							<>
								<Board
									board={
										board
									}
									piece={
										currentPiece
									}
								/>

								{gameOver && (
									<div className="game-over-overlay">
										<span className="game-over-title">
											GAME OVER
										</span>

										<span className="game-over-score">
											SCORE{" "}
											{
												score
											}
										</span>
									</div>
								)}
							</>
						) : (
							<div className="waiting-board">
								<span>
									READY?
								</span>
							</div>
						)}
					</div>
				</section>

				<aside className="game-panel stats-panel">
					<div className="panel-header">
						<span className="panel-dot"></span>

						<h2>
							Game
						</h2>
					</div>

					<div className="score-block">
						<span className="score-label">
							SCORE
						</span>

						<strong className="score-value">
							{String(
								score
							).padStart(
								6,
								"0"
							)}
						</strong>
					</div>

					<div className="current-piece-block">
						<span className="current-piece-label">
							NEXT
						</span>

						<PiecePreview
							piece={
								nextPiece
							}
						/>
					</div>

					<div className="panel-divider"></div>

					<h3 className="controls-title">
						CONTROLS
					</h3>

					<div className="controls">
						<div className="control-row">
							<span>
								Move
							</span>

							<div>
								<kbd>
									←
								</kbd>

								<kbd>
									→
								</kbd>
							</div>
						</div>

						<div className="control-row">
							<span>
								Rotate
							</span>

							<kbd>
								↑
							</kbd>
						</div>

						<div className="control-row">
							<span>
								Soft drop
							</span>

							<kbd>
								↓
							</kbd>
						</div>

						<div className="control-row">
							<span>
								Hard drop
							</span>

							<kbd>
								SPACE
							</kbd>
						</div>
					</div>
				</aside>
			</div>
		</main>
	);
}

export default Game;