import {
	useEffect,
	useRef,
	useState
} from "react";

import {
	useParams
} from "react-router-dom";

import socket from "../../socket/socket.js";

import {
	createBoard
} from "../../game/board.js";

import {
	clearGameSession,
	loadGameSession,
	saveGameSession
} from "../../utils/gameSession.js";

import useSocket from "../../hooks/useSocket.js";
import useKeyboard from "../../hooks/useKeyboard.js";
import useGameLoop from "../../hooks/useGameLoop.js";
import useMultiplayer from "../../hooks/useMultiplayer.js";

import PlayerList from "../../components/PlayerList/PlayerList.jsx";
import GameStatus from "../../components/GameStatus/GameStatus.jsx";
import GamePanel from "../../components/GamePanel/GamePanel.jsx";
import Opponent from "../../components/Opponent/Opponent.jsx";

import Ranking from "../Ranking/Ranking.jsx";

function Game() {
	const {
		room,
		player
	} = useParams();

	const [
		board,
		setBoard
	] = useState(
		() => createBoard()
	);

	const [
		score,
		setScore
	] = useState(0);

	const [
		gameOver,
		setGameOver
	] = useState(false);

	const [
		showRanking,
		setShowRanking
	] = useState(false);

	const [
		isFading,
		setIsFading
	] = useState(false);

	const [
		isFinishing,
		setIsFinishing
	] = useState(false);

	const [
		ranking,
		setRanking
	] = useState([]);

	const [
		finishedMode,
		setFinishedMode
	] = useState(null);

	const [
		countdown,
		setCountdown
	] = useState(null);

	const [
		gamePlayable,
		setGamePlayable
	] = useState(false);

	const [
		sessionReady,
		setSessionReady
	] = useState(false);

	/*
	 * Prevent the same server round
	 * from being initialized twice.
	 */
	const initializedRoundRef =
		useRef(null);

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
	 * ROUND INITIALIZATION / REFRESH
	 * =================================
	 *
	 * If the server roundId matches
	 * our sessionStorage snapshot,
	 * restore the current game.
	 *
	 * Otherwise this is a new round.
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
		 * Important with React
		 * StrictMode.
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
		 * REFRESH / RECONNECT
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
		 * NEW ROUND
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

		/*
		 * Only request the first
		 * piece for a genuinely
		 * new round.
		 */
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
		setCurrentPiece,
		setNextPiece
	]);

	/*
	 * =================================
	 * SAVE ROUND STATE
	 * =================================
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
		 * Avoid saving the tiny empty
		 * state before the first piece
		 * arrives.
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

	/*
	 * =================================
	 * COUNTDOWN
	 * =================================
	 */
	useEffect(() => {
		if (
			!roomState?.started ||
			!roomState?.countdownEndsAt
		) {
			setCountdown(
				null
			);

			setGamePlayable(
				false
			);

			return;
		}

		let goTimeout =
			null;

		const updateCountdown =
			() => {
				const remaining =
					roomState.countdownEndsAt -
					Date.now();

				if (
					remaining <= 0
				) {
					setCountdown(
						"GO"
					);

					setGamePlayable(
						true
					);

					goTimeout =
						setTimeout(
							() => {
								setCountdown(
									null
								);
							},
							500
						);

					return true;
				}

				setCountdown(
					Math.ceil(
						remaining /
							1000
					)
				);

				setGamePlayable(
					false
				);

				return false;
			};

		const finished =
			updateCountdown();

		if (finished) {
			return () => {
				if (
					goTimeout
				) {
					clearTimeout(
						goTimeout
					);
				}
			};
		}

		const interval =
			setInterval(
				() => {
					if (
						updateCountdown()
					) {
						clearInterval(
							interval
						);
					}
				},
				100
			);

		return () => {
			clearInterval(
				interval
			);

			if (
				goTimeout
			) {
				clearTimeout(
					goTimeout
				);
			}
		};
	}, [
		roomState?.started,
		roomState?.countdownEndsAt
	]);

	/*
	 * GAME LOOP
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
	 * CONTROLS
	 */
	useKeyboard({
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
	 * MULTIPLAYER
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

	const isHost =
		roomState?.hostId ===
		playerId;

	/*
	 * GAME MODE
	 */
	const handleModeChange =
		(mode) => {
			if (
				!isHost ||
				roomState?.started ||
				(
					roomState?.players
						?.length ??
					0
				) <= 1
			) {
				return;
			}

			socket.emit(
				"game:mode",
				{
					room,
					mode
				}
			);
		};

	/*
	 * START
	 */
	const handleStart =
		() => {
			if (
				!isHost ||
				roomState?.started
			) {
				return;
			}

			setBoard(
				createBoard()
			);

			setScore(
				0
			);

			setGameOver(
				false
			);

			setShowRanking(
				false
			);

			setIsFading(
				false
			);

			setIsFinishing(
				false
			);

			setRanking(
				[]
			);

			setFinishedMode(
				null
			);

			setCountdown(
				null
			);

			setGamePlayable(
				false
			);

			setSessionReady(
				false
			);

			setCurrentPiece(
				null
			);

			setNextPiece(
				null
			);

			initializedRoundRef.current =
				null;

			clearGameSession(
				room,
				playerId
			);

			socket.emit(
				"game:start",
				{
					room
				}
			);
		};

	/*
	 * =================================
	 * FINAL RANKING
	 * =================================
	 */
	useEffect(() => {
		let fadeTimeout =
			null;

		let rankingTimeout =
			null;

		const onGameFinished =
			(data) => {
				console.log(
					"FINAL RANKING:",
					data.ranking
				);

				console.log(
					"FINISHED MODE:",
					data.mode
				);

				setRanking(
					data.ranking ??
						[]
				);

				setFinishedMode(
					data.mode ??
						null
				);

				setGamePlayable(
					false
				);

				/*
				 * The server round is over.
				 * Snapshot is no longer
				 * needed.
				 */
				clearGameSession(
					room,
					playerId
				);

				setSessionReady(
					false
				);

				initializedRoundRef.current =
					null;

				/*
				 * SOLO
				 *
				 * Keep final board and
				 * GAME OVER visible.
				 * No ranking screen.
				 */
				if (
					data.mode ===
					"solo"
				) {
					setIsFinishing(
						false
					);

					setIsFading(
						false
					);

					setShowRanking(
						false
					);

					return;
				}

				/*
				 * MULTIPLAYER
				 */
				setIsFinishing(
					true
				);

				fadeTimeout =
					setTimeout(
						() => {
							setIsFading(
								true
							);
						},
						2500
					);

				rankingTimeout =
					setTimeout(
						() => {
							setShowRanking(
								true
							);

							setIsFading(
								false
							);

							setIsFinishing(
								false
							);
						},
						3000
					);
			};

		socket.on(
			"game:finished",
			onGameFinished
		);

		return () => {
			socket.off(
				"game:finished",
				onGameFinished
			);

			if (
				fadeTimeout
			) {
				clearTimeout(
					fadeTimeout
				);
			}

			if (
				rankingTimeout
			) {
				clearTimeout(
					rankingTimeout
				);
			}
		};
	}, [
		room,
		playerId
	]);

	/*
	 * RECEIVE PENALTY
	 */
	useEffect(() => {
		const onPenaltyAdd =
			({
				count,
				from
			}) => {
				console.log(
					`Penalty received from ${from}:`,
					count
				);

				applyPenalty(
					count
				);
			};

		socket.on(
			"penalty:add",
			onPenaltyAdd
		);

		return () => {
			socket.off(
				"penalty:add",
				onPenaltyAdd
			);
		};
	}, [
		applyPenalty
	]);

	/*
	 * PLAY AGAIN
	 */
	const handleRestart =
		() => {
			if (!isHost)
				return;

			socket.emit(
				"game:restart",
				{
					room
				}
			);
		};

	/*
	 * =================================
	 * RETURN TO LOBBY
	 * =================================
	 */
	useEffect(() => {
		const onGameRestart =
			() => {
				setBoard(
					createBoard()
				);

				setScore(
					0
				);

				setGameOver(
					false
				);

				setShowRanking(
					false
				);

				setIsFading(
					false
				);

				setIsFinishing(
					false
				);

				setRanking(
					[]
				);

				setFinishedMode(
					null
				);

				setCountdown(
					null
				);

				setGamePlayable(
					false
				);

				setSessionReady(
					false
				);

				setCurrentPiece(
					null
				);

				setNextPiece(
					null
				);

				initializedRoundRef.current =
					null;

				clearGameSession(
					room,
					playerId
				);
			};

		socket.on(
			"game:restart",
			onGameRestart
		);

		return () => {
			socket.off(
				"game:restart",
				onGameRestart
			);
		};
	}, [
		room,
		playerId,
		setCurrentPiece,
		setNextPiece
	]);

	/*
	 * Keep final board displayed
	 * after server sets started=false.
	 */
	const showBoard =
		Boolean(
			roomState?.started ||
			isFinishing ||
			gameOver
		);

	return (
		<main className="game-page">
			<header className="game-header">
				<h1 className="game-title">
					<span>
						RED
					</span>{" "}
					TETRIS
				</h1>

				<div className="room-badge">
					ROOM //{" "}
					{room.toUpperCase()}
				</div>
			</header>

			{showRanking &&
			finishedMode !== "solo" ? (
				<Ranking
					players={
						ranking
					}

					currentPlayerId={
						playerId
					}

					isHost={
						isHost
					}

					onRestart={
						handleRestart
					}

					mode={
						finishedMode
					}
				/>
			) : (
				<div className="game-layout">
					<PlayerList
						roomState={
							roomState
						}

						player={
							player
						}

						playerId={
							playerId
						}

						error={
							error
						}

						isHost={
							isHost
						}

						onStart={
							handleStart
						}

						mode={
							roomState?.mode
						}

						onModeChange={
							handleModeChange
						}
					/>

					<GameStatus
						started={
							showBoard
						}

						finishing={
							isFinishing
						}

						board={
							board
						}

						currentPiece={
							currentPiece
						}

						gameOver={
							gameOver
						}

						score={
							score
						}

						countdown={
							countdown
						}
					/>

					<div className="game-side-column">
						<GamePanel
							score={
								score
							}

							nextPiece={
								nextPiece
							}
						/>

						{opponents.length >
							0 && (
							<div className="opponents-list">
								{opponents.map(
									(opponent) => (
										<Opponent
											key={
												opponent.id
											}

											name={
												opponent.name
											}

											spectrum={
												opponent.spectrum
											}
										/>
									)
								)}
							</div>
						)}
					</div>
				</div>
			)}

			{isFading && (
				<div className="ranking-fade-overlay" />
			)}
		</main>
	);
}

export default Game;