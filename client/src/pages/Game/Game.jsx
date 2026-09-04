import {
	useEffect,
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
	addPenaltyLines
} from "../../game/penalty.js";

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
		ranking,
		setRanking
	] = useState([]);

	/*
	 * SOCKET / ROOM
	 */
	const {
		playerId,

		roomState,

		error,

		currentPiece,
		setCurrentPiece,

		nextPiece
	} = useSocket(
		room,
		player
	);

	/*
	 * CONTROLS
	 */
	useKeyboard({
		started:
			roomState?.started,

		gameOver,

		board,

		currentPiece,

		setCurrentPiece
	});

	/*
	 * GAME LOOP
	 */
	useGameLoop({
		room,

		started:
			roomState?.started,

		board,
		setBoard,

		currentPiece,
		setCurrentPiece,

		gameOver,
		setGameOver,

		setScore
	});

	/*
	 * SPECTRUM
	 */
	const {
		opponents
	} = useMultiplayer({
		room,

		started:
			roomState?.started,

		board
	});

	/*
	 * HOST
	 */
	const isHost =
		roomState?.hostId ===
		playerId;

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

			socket.emit(
				"game:start",
				{
					room
				}
			);
		};

	/*
	 * FINAL RANKING
	 *
	 * Ranking appears only when
	 * the server decides every
	 * player finished.
	 */
	useEffect(() => {
		let fadeTimeout =
			null;

		const onGameFinished =
			(data) => {
				console.log(
					"FINAL RANKING:",
					data.ranking
				);

				setRanking(
					data.ranking ??
						[]
				);

				setIsFading(
					true
				);

				fadeTimeout =
					setTimeout(
						() => {
							setShowRanking(
								true
							);

							setIsFading(
								false
							);
						},
						700
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
		};
	}, []);

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

				setBoard(
					(currentBoard) =>
						addPenaltyLines(
							currentBoard,
							count
						)
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
	}, []);

	/*
	 * HOST REQUESTS RESTART
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
	 * EVERYBODY RECEIVES RESTART
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

				setRanking(
					[]
				);

				setCurrentPiece(
					null
				);

				socket.emit(
					"piece:next",
					{
						room
					}
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
		setCurrentPiece
	]);

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

			{showRanking ? (
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
					/>

					<GameStatus
						started={
							roomState?.started
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