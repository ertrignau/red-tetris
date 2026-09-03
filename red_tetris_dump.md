# Red Tetris project dump

## File tree

```text
README.md
client/index.html
client/package.json
client/src/app/App.jsx
client/src/app/router.jsx
client/src/components/Board/Board.jsx
client/src/components/Cell/Cell.jsx
client/src/components/GamePanel/GamePanel.jsx
client/src/components/GameStatus/GameStatus.jsx
client/src/components/Opponent/Opponent.jsx
client/src/components/PiecePreview/PiecePreview.jsx
client/src/components/PlayerList/PlayerList.jsx
client/src/components/Spectrum/Spectrum.jsx
client/src/game/board.js
client/src/game/collision.js
client/src/game/drop.js
client/src/game/lines.js
client/src/game/movement.js
client/src/game/penalty.js
client/src/game/pieces.js
client/src/game/rotation.js
client/src/game/scoring.js
client/src/game/spectrum.js
client/src/hooks/useGameLoop.js
client/src/hooks/useKeyboard.js
client/src/hooks/useMultiplayer.js
client/src/hooks/useSocket.js
client/src/main.jsx
client/src/pages/Game/Game.jsx
client/src/pages/Home/Home.jsx
client/src/pages/Ranking/Ranking.jsx
client/src/socket/events.js
client/src/socket/socket.js
client/src/store/gameReducer.js
client/src/store/initialState.js
client/src/styles/game.css
client/src/styles/home.css
client/src/styles/ranking.css
client/src/utils/playerIdentity.js
client/vite.config.js
package.json
server/package.json
server/src/app.js
server/src/classes/Game.js
server/src/classes/Piece.js
server/src/classes/Player.js
server/src/managers/GameManager.js
server/src/protocol/events.js
server/src/server.js
server/src/socket/connection.js
server/src/socket/gameHandlers.js
server/src/socket/playerHandlers.js
shared/constants.js
shared/events.js
```

# Files

## `README.md`

```markdown
# red-tetris
A Tetris web game
```

## `client/index.html`

```html
<!doctype html>
<html lang="en">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Red Tetris</title>
</head>
<body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
</body>
</html>
```

## `client/package.json`

```json
{
  "name": "red-tetris-client",
  "version": "1.0.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "react-router-dom": "^7.0.0",
    "socket.io-client": "^4.0.0"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^5.0.0",
    "vite": "^7.0.0"
  }
}
```

## `client/src/app/App.jsx`

```jsx
import { useEffect, useState } from "react";
import socket from "../socket/socket.js";

function App() {
    const [connected, setConnected] = useState(socket.connected);

    useEffect(() => {
        const onConnect = () => {
            console.log("Connected:", socket.id);
            setConnected(true);

			socket.emit("ping:test", {
				message: "hello server"
			});
        };

        const onDisconnect = () => {
            console.log("Disconnected");
            setConnected(false);
        };

		const onPong = (data) => {
			console.log("Server response:", data);
		};

        socket.on("connect", onConnect);
        socket.on("disconnect", onDisconnect);
		socket.on("pong:test", onPong);

        return () => {
            socket.off("connect", onConnect);
            socket.off("disconnect", onDisconnect);
			socket.off("pong:test", onPong);
        };
    }, []);

    return (
        <main>
            <h1>Red Tetris</h1>
            <p>
                Socket: {connected ? "connected" : "disconnected"}
            </p>
        </main>
    );
}

export default App;
```

## `client/src/app/router.jsx`

```jsx
import { createBrowserRouter } from "react-router-dom";
import Home from "../pages/Home/Home.jsx";
import Game from "../pages/Game/Game.jsx";

const router = createBrowserRouter([
	{
		path: "/",
		element: <Home />
	},
	{
		path: "/:room/:player",
		element: <Game />
	}
]);

export default router;
```

## `client/src/components/Board/Board.jsx`

```jsx
import Cell from "../Cell/Cell.jsx";

import {
	getGhostPiece
} from "../../game/drop.js";

function Board({
	board,
	piece
}) {
	const displayBoard =
		board.map(
			(row) => [...row]
		);

	const ghostPiece =
		piece
			? getGhostPiece(
				board,
				piece
			)
			: null;

	/*
	 * Draw ghost piece first.
	 */
	if (ghostPiece) {
		ghostPiece.shape.forEach(
			(row, y) => {
				row.forEach(
					(cell, x) => {
						if (!cell)
							return;

						const boardY =
							ghostPiece.y + y;

						const boardX =
							ghostPiece.x + x;

						if (
							boardY >= 0 &&
							boardY <
								displayBoard.length &&
							boardX >= 0 &&
							boardX <
								displayBoard[0].length &&
							displayBoard[
								boardY
							][
								boardX
							] === null
						) {
							displayBoard[
								boardY
							][
								boardX
							] =
								`ghost-${ghostPiece.type}`;
						}
					}
				);
			}
		);
	}

	/*
	 * Draw current piece on top.
	 */
	if (piece) {
		piece.shape.forEach(
			(row, y) => {
				row.forEach(
					(cell, x) => {
						if (!cell)
							return;

						const boardY =
							piece.y + y;

						const boardX =
							piece.x + x;

						if (
							boardY >= 0 &&
							boardY <
								displayBoard.length &&
							boardX >= 0 &&
							boardX <
								displayBoard[0].length
						) {
							displayBoard[
								boardY
							][
								boardX
							] =
								piece.type;
						}
					}
				);
			}
		);
	}

	return (
		<div className="board">
			{displayBoard
				.flat()
				.map(
					(cell, index) => (
						<Cell
							key={
								index
							}
							value={
								cell
							}
						/>
					)
				)}
		</div>
	);
}

export default Board;
```

## `client/src/components/Cell/Cell.jsx`

```jsx
function Cell({ value }) {
	return (
		<div
			className={`cell ${value ? `cell-${value}` : ""}`}
		/>
	);
}

export default Cell;
```

## `client/src/components/GamePanel/GamePanel.jsx`

```jsx
import PiecePreview from "../PiecePreview/PiecePreview.jsx";

function GamePanel({
	score,
	nextPiece
}) {
	return (
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
	);
}

export default GamePanel;
```

## `client/src/components/GameStatus/GameStatus.jsx`

```jsx
import Board from "../Board/Board.jsx";

function GameStatus({
	started,
	board,
	currentPiece,
	gameOver,
	score
}) {
	return (
		<section className="board-section">
			<div className="game-status">
				<span
					className={
						gameOver
							? "status-light game-over-light"
							: started
								? "status-light online"
								: "status-light"
					}
				></span>

				{gameOver
					? "GAME OVER"
					: started
						? "GAME IN PROGRESS"
						: "WAITING FOR HOST"}
			</div>

			<div className="board-frame">
				{started ? (
					<>
						<Board
							board={board}
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
									{score}
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
	);
}

export default GameStatus;
```

## `client/src/components/Opponent/Opponent.jsx`

```jsx
import Spectrum from "../Spectrum/Spectrum.jsx";

function Opponent({
	name,
	spectrum
}) {
	return (
		<div className="opponent">
			<div className="opponent-header">
				<span className="opponent-dot" />

				<strong>
					{name}
				</strong>
			</div>

			<Spectrum
				spectrum={
					spectrum
				}
			/>
		</div>
	);
}

export default Opponent;
```

## `client/src/components/PiecePreview/PiecePreview.jsx`

```jsx
function PiecePreview({ piece }) {
	if (!piece)
		return (
			<div className="piece-preview empty-preview">
				-
			</div>
		);

	const shape = piece.shape;

	return (
		<div
			className="piece-preview"
			style={{
				gridTemplateColumns: `repeat(${shape[0].length}, 18px)`,
				gridTemplateRows: `repeat(${shape.length}, 18px)`
			}}
		>
			{shape.flat().map((cell, index) => (
				<div
					key={index}
					className={
						cell
							? `preview-cell cell-${piece.type}`
							: "preview-cell"
					}
				/>
			))}
		</div>
	);
}

export default PiecePreview;
```

## `client/src/components/PlayerList/PlayerList.jsx`

```jsx
function PlayerList({
	roomState,
	player,
	playerId,
	error,
	isHost,
	onStart
}) {
	return (
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
						(roomPlayer) => (
							<li
								key={
									roomPlayer.playerId
								}
								className={
									roomPlayer.playerId ===
									playerId
										? "player active-player"
										: "player"
								}
							>
								<div className="player-avatar">
									{roomPlayer.name
										.charAt(0)
										.toUpperCase()}
								</div>

								<span className="player-name">
									{
										roomPlayer.name
									}
								</span>

								{roomPlayer.isHost && (
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
							onStart
						}
					>
						START GAME
					</button>
				)}
		</aside>
	);
}

export default PlayerList;
```

## `client/src/components/Spectrum/Spectrum.jsx`

```jsx
function Spectrum({
	spectrum
}) {
	return (
		<div className="spectrum">
			{spectrum.map(
				(height, index) => (
					<div
						key={index}
						className="spectrum-column"
					>
						<div
							className="spectrum-fill"
							style={{
								height:
									`${height * 5}px`
							}}
						/>
					</div>
				)
			)}
		</div>
	);
}

export default Spectrum;
```

## `client/src/game/board.js`

```javascript
export const BOARD_WIDTH = 10;
export const BOARD_HEIGHT = 20;

export function createBoard() {
	return Array.from(
		{ length: BOARD_HEIGHT },
		() => Array(BOARD_WIDTH).fill(null)
	);
}

export function lockPiece(board, piece) {
	const nextBoard = board.map((row) => [...row]);

	piece.shape.forEach((row, y) => {
		row.forEach((cell, x) => {
			if (!cell)
				return;

			const boardX = piece.x + x;
			const boardY = piece.y + y;

			if (
				boardY >= 0 &&
				boardY < nextBoard.length &&
				boardX >= 0 &&
				boardX < nextBoard[0].length
			) {
				nextBoard[boardY][boardX] = piece.type;
			}
		});
	});

	return nextBoard;
}
```

## `client/src/game/collision.js`

```javascript
export function hasCollision(board, piece) {
	const { shape, x, y } = piece;

	for (let row = 0; row < shape.length; row++) {
		for (let col = 0; col < shape[row].length; col++) {
			if (!shape[row][col])
				continue;

			const boardX = x + col;
			const boardY = y + row;

			if (
				boardX < 0 ||
				boardX >= board[0].length ||
				boardY >= board.length
			) {
				return true;
			}

			if (
				boardY >= 0 &&
				board[boardY][boardX] !== null
			) {
				return true;
			}
		}
	}

	return false;
}
```

## `client/src/game/drop.js`

```javascript
import { hasCollision } from "./collision.js";

export function hardDrop(board, piece) {
	let droppedPiece = {
		...piece
	};

	while (true) {
		const nextPiece = {
			...droppedPiece,
			y: droppedPiece.y + 1
		};

		if (hasCollision(board, nextPiece))
			break;

		droppedPiece = nextPiece;
	}

	return droppedPiece;
}

export function getGhostPiece(board, piece) {
	if (!piece)
		return null;

	return hardDrop(board, piece);
}
```

## `client/src/game/lines.js`

```javascript
export function clearLines(board) {
	const width = board[0].length;

	const remainingRows = board.filter((row) =>
		row.some((cell) => cell === null)
	);

	const clearedLines = board.length - remainingRows.length;

	const emptyRows = Array.from(
		{ length: clearedLines },
		() => Array(width).fill(null)
	);

	return {
		board: [
			...emptyRows,
			...remainingRows
		],
		clearedLines
	};
}
```

## `client/src/game/movement.js`

```javascript
import { hasCollision } from "./collision.js";

export function movePiece(board, piece, dx, dy) {
	const nextPiece = {
		...piece,
		x: piece.x + dx,
		y: piece.y + dy
	};

	if (hasCollision(board, nextPiece))
		return piece;

	return nextPiece;
}

export function moveLeft(board, piece) {
	return movePiece(board, piece, -1, 0);
}

export function moveRight(board, piece) {
	return movePiece(board, piece, 1, 0);
}

export function moveDown(board, piece) {
	return movePiece(board, piece, 0, 1);
}
```

## `client/src/game/penalty.js`

```javascript

```

## `client/src/game/pieces.js`

```javascript
export const TETRIMINOS = {
	I: [
		[1, 1, 1, 1]
	],

	O: [
		[1, 1],
		[1, 1]
	],

	T: [
		[0, 1, 0],
		[1, 1, 1]
	],

	S: [
		[0, 1, 1],
		[1, 1, 0]
	],

	Z: [
		[1, 1, 0],
		[0, 1, 1]
	],

	J: [
		[1, 0, 0],
		[1, 1, 1]
	],

	L: [
		[0, 0, 1],
		[1, 1, 1]
	]
};

export function createPiece(type) {
	return {
		type,
		shape: TETRIMINOS[type],
		x: 3,
		y: 0,
		rotation: 0
	};
}
```

## `client/src/game/rotation.js`

```javascript
import { hasCollision } from "./collision.js";

function rotateShape(shape) {
	const height = shape.length;
	const width = shape[0].length;

	const rotated = Array.from(
		{ length: width },
		() => Array(height).fill(0)
	);

	for (let y = 0; y < height; y++) {
		for (let x = 0; x < width; x++) {
			rotated[x][height - 1 - y] = shape[y][x];
		}
	}

	return rotated;
}

export function rotatePiece(board, piece) {
	const rotatedShape = rotateShape(piece.shape);

	const rotatedPiece = {
		...piece,
		shape: rotatedShape,
		rotation: (piece.rotation + 1) % 4
	};

	if (hasCollision(board, rotatedPiece))
		return piece;

	return rotatedPiece;
}
```

## `client/src/game/scoring.js`

```javascript
const SCORE_TABLE = {
	0: 0,
	1: 100,
	2: 300,
	3: 500,
	4: 800
};

export function calculateScore(clearedLines) {
	return SCORE_TABLE[clearedLines] ?? 0;
}
```

## `client/src/game/spectrum.js`

```javascript
export function calculateSpectrum(board) {
	if (!board || board.length === 0)
		return [];

	const height = board.length;
	const width = board[0].length;

	return Array.from(
		{ length: width },
		(_, x) => {
			for (let y = 0; y < height; y++) {
				if (board[y][x] !== null) {
					return height - y;
				}
			}

			return 0;
		}
	);
}
```

## `client/src/hooks/useGameLoop.js`

```javascript
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
		}
	}, [
		started,
		currentPiece,
		board,
		gameOver,
		setCurrentPiece,
		setGameOver
	]);

	useEffect(() => {
		if (
			!started ||
			gameOver
		) {
			return;
		}

		const gravityInterval =
			setInterval(() => {
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
				}

				socket.emit(
					"piece:next",
					{
						room
					}
				);
			}, 700);

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
```

## `client/src/hooks/useKeyboard.js`

```javascript
import { useEffect } from "react";

import {
	moveLeft,
	moveRight,
	moveDown
} from "../game/movement.js";

import { rotatePiece } from "../game/rotation.js";
import { hardDrop } from "../game/drop.js";

function useKeyboard({
	started,
	gameOver,
	board,
	currentPiece,
	setCurrentPiece
}) {
	useEffect(() => {
		if (
			!started ||
			!currentPiece ||
			gameOver
		) {
			return;
		}

		const handleKeyDown = (event) => {
			/*
			 * Rotation and hard drop must happen
			 * only once per physical key press.
			 *
			 * Holding the key would otherwise
			 * continuously reset the game loop.
			 */
			if (
				event.repeat &&
				(
					event.code === "ArrowUp" ||
					event.code === "Space"
				)
			) {
				event.preventDefault();
				return;
			}

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
		started,
		gameOver,
		board,
		currentPiece,
		setCurrentPiece
	]);
}

export default useKeyboard;
```

## `client/src/hooks/useMultiplayer.js`

```javascript
import {
	useEffect,
	useState
} from "react";

import socket from "../socket/socket.js";

import {
	calculateSpectrum
} from "../game/spectrum.js";

function useMultiplayer({
	room,
	started,
	board
}) {
	const [
		opponents,
		setOpponents
	] = useState({});

	useEffect(() => {
		if (!started)
			return;

		const spectrum =
			calculateSpectrum(
				board
			);

		socket.emit(
			"spectrum:update",
			{
				room,
				spectrum
			}
		);
	}, [
		room,
		started,
		board
	]);

	useEffect(() => {
		const handleSpectrum =
			(data) => {
				setOpponents(
					(current) => ({
						...current,

						[data.playerId]: {
							id:
								data.playerId,

							name:
								data.playerName,

							spectrum:
								data.spectrum
						}
					})
				);
			};

		socket.on(
			"spectrum:update",
			handleSpectrum
		);

		return () => {
			socket.off(
				"spectrum:update",
				handleSpectrum
			);
		};
	}, []);

	return {
		opponents:
			Object.values(
				opponents
			)
	};
}

export default useMultiplayer;
```

## `client/src/hooks/useSocket.js`

```javascript
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
	const [roomState, setRoomState] =
		useState(null);

	const [error, setError] =
		useState(null);

	const [
		currentPiece,
		setCurrentPiece
	] = useState(null);

	const [
		nextPiece,
		setNextPiece
	] = useState(null);

	/*
	 * Stable for this browser tab.
	 */
	const [playerId] =
		useState(
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

	useEffect(() => {
		if (
			!roomState?.started
		) {
			return;
		}

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

	return {
		playerId,

		roomState,

		error,

		currentPiece,
		setCurrentPiece,

		nextPiece
	};
}

export default useSocket;
```

## `client/src/main.jsx`

```jsx
import React from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider } from "react-router-dom";

import router from "./app/router.jsx";
import "./styles/game.css";
import "./styles/home.css";
import "./styles/ranking.css";

ReactDOM.createRoot(
	document.getElementById("root")
).render(
	<React.StrictMode>
		<RouterProvider router={router} />
	</React.StrictMode>
);
```

## `client/src/pages/Game/Game.jsx`

```jsx
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

	const [board, setBoard] =
		useState(
			() => createBoard()
		);

	const [score, setScore] =
		useState(0);

	const [gameOver, setGameOver] =
		useState(false);

	const [
		showRanking,
		setShowRanking
	] = useState(false);

	const [
		isFading,
		setIsFading
	] = useState(false);

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

	useKeyboard({
		started:
			roomState?.started,

		gameOver,

		board,

		currentPiece,

		setCurrentPiece
	});

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

	const {
		opponents
	} = useMultiplayer({
		room,

		started:
			roomState?.started,

		board
	});

	/*
	 * hostId is now playerId.
	 */
	const isHost =
		roomState?.hostId ===
		playerId;

	const handleStart =
		() => {
			if (!isHost)
				return;

			socket.emit(
				"game:start",
				{
					room
				}
			);
		};

	/*
	 * Current temporary ranking behavior.
	 */
	useEffect(() => {
		if (!gameOver)
			return;

		setIsFading(
			true
		);

		const timeout =
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

		return () => {
			clearTimeout(
				timeout
			);
		};
	}, [
		gameOver
	]);

	/*
	 * Only host can REQUEST restart.
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
	 * Everybody RECEIVES restart.
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

				setCurrentPiece(
					null
				);

				/*
				 * New sequence was reset
				 * server side.
				 */
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
						roomState?.players ??
						[]
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
```

## `client/src/pages/Home/Home.jsx`

```jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";

function Home() {
	const navigate = useNavigate();

	const [player, setPlayer] = useState("");
	const [room, setRoom] = useState("");

	const handleSubmit = (event) => {
		event.preventDefault();

		const cleanPlayer = player.trim();
		const cleanRoom = room.trim();

		if (!cleanPlayer || !cleanRoom)
			return;

		navigate(
			`/${encodeURIComponent(cleanRoom)}/${encodeURIComponent(cleanPlayer)}`
		);
	};

	return (
		<main className="home-page">
			<div className="home-background-glow"></div>

			<section className="home-content">
				<header className="home-header">
					<p className="home-eyebrow">
						MULTIPLAYER BLOCK GAME
					</p>

					<h1 className="home-title">
						<span>RED</span> TETRIS
					</h1>

					<p className="home-subtitle">
						Join a room. Clear lines. Survive.
					</p>
				</header>

				<form
					className="home-card"
					onSubmit={handleSubmit}
				>
					<div className="home-card-header">
						<span className="panel-dot"></span>

						<h2>
							Join game
						</h2>
					</div>

					<label className="home-field">
						<span>
							PLAYER NAME
						</span>

						<input
							type="text"
							value={player}
							onChange={(event) =>
								setPlayer(
									event.target.value
								)
							}
							placeholder="Eric"
							maxLength={20}
							autoComplete="off"
						/>
					</label>

					<label className="home-field">
						<span>
							ROOM
						</span>

						<input
							type="text"
							value={room}
							onChange={(event) =>
								setRoom(
									event.target.value
								)
							}
							placeholder="test"
							maxLength={30}
							autoComplete="off"
						/>
					</label>

					<button
						className="home-join-button"
						type="submit"
						disabled={
							!player.trim() ||
							!room.trim()
						}
					>
						JOIN GAME
					</button>

					<div className="home-separator">
						<span></span>
						<p>CONTROLS</p>
						<span></span>
					</div>

					<div className="home-controls">
						<div>
							<kbd>←</kbd>
							<kbd>→</kbd>
							<span>MOVE</span>
						</div>

						<div>
							<kbd>↑</kbd>
							<span>ROTATE</span>
						</div>

						<div>
							<kbd>↓</kbd>
							<span>DROP</span>
						</div>

						<div>
							<kbd>SPACE</kbd>
							<span>HARD DROP</span>
						</div>
					</div>
				</form>

				<p className="home-footer">
					42 // RED TETRIS
				</p>
			</section>
		</main>
	);
}

export default Home;
```

## `client/src/pages/Ranking/Ranking.jsx`

```jsx
function Ranking({
	players,
	currentPlayerId,
	isHost,
	onRestart
}) {
	return (
		<section className="ranking-screen">
			<div className="ranking-card">
				<p className="ranking-eyebrow">
					MATCH COMPLETE
				</p>

				<h2 className="ranking-title">
					RANKING
				</h2>

				<div className="ranking-list">
					{players.map(
						(player, index) => (
							<div
								key={
									player.playerId
								}
								className={
									player.playerId ===
									currentPlayerId
										? "ranking-row ranking-current"
										: "ranking-row"
								}
							>
								<span className="ranking-position">
									#{index + 1}
								</span>

								<span className="ranking-player">
									{
										player.name
									}
								</span>

								{player.isHost && (
									<span className="ranking-host">
										HOST
									</span>
								)}
							</div>
						)
					)}
				</div>

				<div className="ranking-actions">
					{isHost ? (
						<button
							className="ranking-restart-button"
							onClick={
								onRestart
							}
						>
							PLAY AGAIN
						</button>
					) : (
						<p className="ranking-waiting">
							WAITING FOR HOST...
						</p>
					)}
				</div>
			</div>
		</section>
	);
}

export default Ranking;
```

## `client/src/socket/events.js`

```javascript

```

## `client/src/socket/socket.js`

```javascript
import { io } from "socket.io-client";

const socket = io();

export default socket;
```

## `client/src/store/gameReducer.js`

```javascript

```

## `client/src/store/initialState.js`

```javascript

```

## `client/src/styles/game.css`

```css
:root {
	font-family:
		Inter,
		system-ui,
		-apple-system,
		BlinkMacSystemFont,
		"Segoe UI",
		sans-serif;

	color: #f4f7ff;
	background: #080b12;
}

* {
	box-sizing: border-box;
}

html,
body,
#root {
	margin: 0;
	width: 100%;
	min-height: 100%;
}

body {
	min-width: 100vw;
	min-height: 100vh;

	background:
		radial-gradient(
			circle at 50% 0%,
			#18233c 0%,
			#0b101b 35%,
			#06080e 100%
		);

	color: #f4f7ff;
}

button,
input,
kbd {
	font: inherit;
}

/* ================================= */
/* PAGE */
/* ================================= */

.game-page {
	min-height: 100vh;

	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;

	padding: 32px;
}

/* ================================= */
/* HEADER */
/* ================================= */

.game-header {
	width: 100%;
	max-width: 980px;

	display: flex;
	flex-direction: column;
	align-items: center;

	margin-bottom: 24px;
}

.game-title {
	margin: 0;

	font-size: 40px;
	font-weight: 900;

	letter-spacing: 5px;

	text-transform: uppercase;

	color: #ffffff;

	text-shadow:
		0 0 25px rgba(255, 255, 255, 0.08);
}

.game-title span {
	color: #ff4057;

	text-shadow:
		0 0 20px rgba(255, 64, 87, 0.45);
}

.room-badge {
	margin-top: 10px;

	padding: 6px 14px;

	border: 1px solid #27334b;
	border-radius: 100px;

	background: rgba(12, 17, 28, 0.85);

	color: #7e91af;

	font-size: 11px;
	font-weight: 700;

	letter-spacing: 2px;
}

/* ================================= */
/* MAIN LAYOUT */
/* ================================= */

.game-layout {
	width: 100%;
	max-width: 980px;

	display: grid;

	grid-template-columns:
		220px
		320px
		220px;

	gap: 32px;

	align-items: center;
	justify-content: center;
}

/* ================================= */
/* GENERIC PANELS */
/* ================================= */

.game-panel {
	width: 220px;

	padding: 18px;

	border: 1px solid #263047;
	border-radius: 14px;

	background:
		linear-gradient(
			145deg,
			rgba(20, 27, 43, 0.96),
			rgba(9, 13, 22, 0.96)
		);

	box-shadow:
		0 15px 50px rgba(0, 0, 0, 0.35);
}

.players-panel {
	justify-self: end;
}

.stats-panel {
	justify-self: start;
}

.panel-header {
	display: flex;
	align-items: center;

	gap: 9px;

	margin-bottom: 18px;
}

.panel-header h2 {
	margin: 0;

	color: #e9edf7;

	font-size: 13px;
	font-weight: 800;

	letter-spacing: 2px;

	text-transform: uppercase;
}

.panel-dot {
	width: 7px;
	height: 7px;

	flex-shrink: 0;

	border-radius: 50%;

	background: #ff4057;

	box-shadow:
		0 0 8px rgba(255, 64, 87, 0.8);
}

/* ================================= */
/* PLAYER PANEL */
/* ================================= */

.current-player {
	display: flex;
	justify-content: space-between;
	align-items: center;

	gap: 12px;

	margin-bottom: 15px;
	padding: 10px 12px;

	border-radius: 7px;

	background: #0b101a;
}

.current-player-label {
	color: #65748e;

	font-size: 9px;
	font-weight: 800;

	letter-spacing: 1px;
}

.current-player strong {
	color: #ffffff;

	font-size: 13px;
	font-weight: 800;

	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
}

.player-list {
	list-style: none;

	padding: 0;
	margin: 0;
}

.player {
	display: flex;
	align-items: center;

	gap: 10px;

	width: 100%;

	margin-bottom: 8px;
	padding: 10px;

	border: 1px solid transparent;
	border-radius: 8px;

	background:
		rgba(10, 15, 25, 0.65);
}

.active-player {
	border-color:
		rgba(255, 64, 87, 0.35);

	background:
		rgba(255, 64, 87, 0.06);
}

.player-avatar {
	width: 30px;
	height: 30px;

	display: flex;
	align-items: center;
	justify-content: center;

	flex-shrink: 0;

	border-radius: 7px;

	background:
		linear-gradient(
			135deg,
			#283a59,
			#162138
		);

	color: #ffffff;

	font-size: 12px;
	font-weight: 800;
}

.player-name {
	flex: 1;

	min-width: 0;

	overflow: hidden;

	color: #dce5f3;

	font-size: 13px;

	white-space: nowrap;
	text-overflow: ellipsis;
}

.host-badge {
	flex-shrink: 0;

	padding: 3px 6px;

	border-radius: 4px;

	background:
		rgba(255, 205, 70, 0.13);

	color: #ffd257;

	font-size: 8px;
	font-weight: 900;

	letter-spacing: 0.7px;
}

/* ================================= */
/* CENTER */
/* ================================= */

.board-section {
	width: 320px;

	display: flex;
	flex-direction: column;
	align-items: center;

	justify-self: center;
}

.game-status {
	display: flex;
	align-items: center;
	justify-content: center;

	gap: 7px;

	min-height: 18px;

	margin-bottom: 10px;

	color: #64728a;

	font-size: 10px;
	font-weight: 800;

	letter-spacing: 1.5px;
}

.status-light {
	width: 6px;
	height: 6px;

	flex-shrink: 0;

	border-radius: 50%;

	background: #657086;
}

.status-light.online {
	background: #38df8f;

	box-shadow:
		0 0 8px rgba(56, 223, 143, 0.8);
}

.board-frame {
	width: fit-content;

	padding: 7px;

	border: 1px solid #35435d;
	border-radius: 12px;

	background: #0a0e17;

	box-shadow:
		0 20px 70px rgba(0, 0, 0, 0.55),
		0 0 40px rgba(66, 92, 140, 0.08);
}

/* ================================= */
/* BOARD */
/* ================================= */

.board {
	display: grid;

	grid-template-columns:
		repeat(10, 30px);

	grid-template-rows:
		repeat(20, 30px);

	width: 300px;
	height: 600px;

	overflow: hidden;

	border-radius: 6px;

	background: #080b12;
}

.cell {
	width: 30px;
	height: 30px;

	border:
		1px solid rgba(110, 130, 160, 0.09);

	background:
		rgba(13, 18, 28, 0.9);
}

.cell-I,
.cell-O,
.cell-T,
.cell-S,
.cell-Z,
.cell-J,
.cell-L {
	border:
		1px solid rgba(255, 255, 255, 0.22);

	box-shadow:
		inset 0 0 10px rgba(255, 255, 255, 0.15);
}

.cell-I {
	background:
		linear-gradient(
			135deg,
			#43e5f5,
			#17aabd
		);
}

.cell-O {
	background:
		linear-gradient(
			135deg,
			#ffe96a,
			#e6b52d
		);
}

.cell-T {
	background:
		linear-gradient(
			135deg,
			#d661e3,
			#9639a5
		);
}

.cell-S {
	background:
		linear-gradient(
			135deg,
			#70db86,
			#36a655
		);
}

.cell-Z {
	background:
		linear-gradient(
			135deg,
			#ff6670,
			#d93d4c
		);
}

.cell-J {
	background:
		linear-gradient(
			135deg,
			#5caeff,
			#3478d3
		);
}

.cell-L {
	background:
		linear-gradient(
			135deg,
			#ffac55,
			#eb7b25
		);
}

/* ================================= */
/* WAITING BOARD */
/* ================================= */

.waiting-board {
	width: 300px;
	height: 600px;

	display: flex;
	align-items: center;
	justify-content: center;

	border-radius: 6px;

	background:
		repeating-linear-gradient(
			0deg,
			#0d121c,
			#0d121c 29px,
			#101724 30px
		);

	color: #3f4c61;

	font-size: 24px;
	font-weight: 900;

	letter-spacing: 5px;
}

/* ================================= */
/* SCORE */
/* ================================= */

.score-block {
	display: flex;
	flex-direction: column;

	gap: 4px;

	margin-bottom: 18px;
}

.score-label {
	color: #64728a;

	font-size: 9px;
	font-weight: 900;

	letter-spacing: 2px;
}

.score-value {
	display: block;

	color: #ffffff;

	font-size: 28px;
	font-weight: 900;

	letter-spacing: 3px;

	line-height: 1;
}

.stat-row {
	display: flex;
	justify-content: space-between;
	align-items: center;

	gap: 10px;

	color: #78869d;

	font-size: 12px;
}

.stat-row strong {
	color: #ffffff;

	font-size: 13px;
}

.panel-divider {
	height: 1px;

	margin: 18px 0;

	background: #222c40;
}

/* ================================= */
/* CONTROLS */
/* ================================= */

.controls-title {
	margin:
		0
		0
		12px;

	color: #65738a;

	font-size: 10px;
	font-weight: 800;

	letter-spacing: 2px;
}

.controls {
	display: flex;
	flex-direction: column;

	gap: 12px;
}

.control-row {
	display: flex;
	justify-content: space-between;
	align-items: center;

	gap: 12px;

	color: #8996aa;

	font-size: 11px;
}

.control-row > span {
	flex: 1;
}

.control-row > div {
	display: flex;

	gap: 5px;
}

kbd {
	display: inline-flex;
	align-items: center;
	justify-content: center;

	min-width: 30px;
	height: 26px;

	padding: 0 7px;

	border: 1px solid #35435b;
	border-bottom-width: 2px;
	border-radius: 5px;

	background: #0a0e17;

	color: #e5ebf5;

	font-family: inherit;
	font-size: 10px;
	font-weight: 800;

	white-space: nowrap;
}

/* ================================= */
/* BUTTON */
/* ================================= */

.start-button {
	width: 100%;

	margin-top: 15px;
	padding: 11px;

	border: 0;
	border-radius: 7px;

	background:
		linear-gradient(
			135deg,
			#ff4057,
			#df2d45
		);

	color: #ffffff;

	font-weight: 900;

	letter-spacing: 1px;

	cursor: pointer;

	box-shadow:
		0 7px 20px rgba(255, 64, 87, 0.2);

	transition:
		transform 0.15s ease,
		box-shadow 0.15s ease;
}

.start-button:hover {
	transform: translateY(-1px);

	box-shadow:
		0 10px 25px rgba(255, 64, 87, 0.32);
}

.start-button:active {
	transform: translateY(0);
}

/* ================================= */
/* ERROR */
/* ================================= */

.game-error {
	margin-bottom: 12px;
	padding: 8px 10px;

	border:
		1px solid rgba(255, 64, 87, 0.3);
	border-radius: 6px;

	background:
		rgba(255, 64, 87, 0.08);

	color: #ff7182;

	font-size: 11px;
}

.muted {
	margin: 0;

	color: #68768d;

	font-size: 11px;
}

/* ================================= */
/* RESPONSIVE */
/* ================================= */

@media (max-width: 900px) {
	.game-page {
		justify-content: flex-start;

		padding:
			24px
			16px;
	}

	.game-layout {
		grid-template-columns: 1fr;

		gap: 24px;

		justify-items: center;
	}

	.game-panel {
		width: 300px;
	}

	.players-panel,
	.stats-panel {
		justify-self: center;
	}

	.players-panel {
		order: 2;
	}

	.board-section {
		order: 1;
	}

	.stats-panel {
		order: 3;
	}

	.game-title {
		font-size: 30px;

		letter-spacing: 4px;
	}
}

@media (max-width: 420px) {
	.game-page {
		padding:
			20px
			8px;
	}

	.game-panel {
		width: 100%;
		max-width: 300px;
	}

	.board-section {
		width: 100%;
	}

	.board-frame {
		transform: scale(0.9);

		transform-origin: top center;

		margin-bottom: -60px;
	}
}

.board-frame {
	position: relative;
}

.game-over-overlay {
	position: absolute;
	inset: 7px;

	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;

	gap: 12px;

	border-radius: 6px;

	background:
		rgba(5, 8, 14, 0.84);

	backdrop-filter:
		blur(2px);

	animation:
		game-over-appear
		0.25s ease-out;
}

.game-over-title {
	color: #ff4057;

	font-size: 28px;
	font-weight: 900;

	letter-spacing: 4px;

	text-shadow:
		0 0 20px
		rgba(255, 64, 87, 0.6);
}

.game-over-score {
	color: #8996aa;

	font-size: 11px;
	font-weight: 800;

	letter-spacing: 2px;
}

.game-over-light {
	background: #ff4057;

	box-shadow:
		0 0 8px
		rgba(255, 64, 87, 0.8);
}

@keyframes game-over-appear {
	from {
		opacity: 0;
		transform: scale(0.96);
	}

	to {
		opacity: 1;
		transform: scale(1);
	}
}

.current-piece-block {
	display: flex;
	flex-direction: column;
	gap: 10px;

	margin-top: 14px;
}

.current-piece-label {
	color: #64728a;

	font-size: 9px;
	font-weight: 900;

	letter-spacing: 2px;
}

.piece-preview {
	display: grid;

	width: fit-content;
	min-width: 72px;
	min-height: 54px;

	align-content: center;
	justify-content: center;

	padding: 10px;

	border: 1px solid #263047;
	border-radius: 8px;

	background: #090d15;
}

.preview-cell {
	width: 18px;
	height: 18px;
}

.preview-cell.cell-I,
.preview-cell.cell-O,
.preview-cell.cell-T,
.preview-cell.cell-S,
.preview-cell.cell-Z,
.preview-cell.cell-J,
.preview-cell.cell-L {
	border:
		1px solid rgba(255, 255, 255, 0.22);

	box-shadow:
		inset 0 0 6px rgba(255, 255, 255, 0.12);
}

.empty-preview {
	display: flex;
	align-items: center;
	justify-content: center;

	color: #64728a;
}

.cell-ghost-I,
.cell-ghost-O,
.cell-ghost-T,
.cell-ghost-S,
.cell-ghost-Z,
.cell-ghost-J,
.cell-ghost-L {
	background: rgba(255, 64, 87, 0.03);
	border: 1px solid rgba(255, 64, 87, 0.85);
	box-shadow: none;
}

.opponents-list {
	display: flex;
	flex-direction: column;
	gap: 12px;
}

.opponent {
	padding: 12px;

	border: 1px solid #263047;
	border-radius: 8px;

	background: #090d15;
}

.opponent-header {
	display: flex;
	align-items: center;

	gap: 7px;

	margin-bottom: 10px;

	color: #dce5f3;

	font-size: 11px;
}

.opponent-dot {
	width: 6px;
	height: 6px;

	border-radius: 50%;

	background: #ff4057;
}

.spectrum {
	height: 100px;

	display: grid;

	grid-template-columns:
		repeat(10, 6px);

	align-items: end;

	gap: 2px;
}

.spectrum-column {
	height: 100px;

	display: flex;
	align-items: flex-end;

	background:
		rgba(255, 255, 255, 0.025);
}

.spectrum-fill {
	width: 100%;

	background:
		rgba(255, 64, 87, 0.55);
}
```

## `client/src/styles/home.css`

```css
/* ================================= */
/* HOME */
/* ================================= */

.home-page {
	position: relative;

	min-height: 100vh;

	display: flex;
	align-items: center;
	justify-content: center;

	overflow: hidden;

	padding: 32px;
}

.home-background-glow {
	position: absolute;

	top: -300px;
	left: 50%;

	width: 700px;
	height: 700px;

	transform: translateX(-50%);

	border-radius: 50%;

	background:
		radial-gradient(
			circle,
			rgba(255, 64, 87, 0.12),
			rgba(45, 71, 120, 0.08) 35%,
			transparent 70%
		);

	pointer-events: none;
}

.home-content {
	position: relative;
	z-index: 1;

	width: 100%;
	max-width: 430px;

	display: flex;
	flex-direction: column;
	align-items: center;
}

.home-header {
	margin-bottom: 28px;

	text-align: center;
}

.home-eyebrow {
	margin:
		0
		0
		10px;

	color: #63718a;

	font-size: 10px;
	font-weight: 800;

	letter-spacing: 3px;
}

.home-title {
	margin: 0;

	color: #ffffff;

	font-size: 48px;
	font-weight: 900;

	letter-spacing: 6px;

	text-transform: uppercase;

	text-shadow:
		0 0 25px
		rgba(255, 255, 255, 0.08);
}

.home-title span {
	color: #ff4057;

	text-shadow:
		0 0 24px
		rgba(255, 64, 87, 0.45);
}

.home-subtitle {
	margin:
		10px
		0
		0;

	color: #7c899e;

	font-size: 12px;

	letter-spacing: 1px;
}

.home-card {
	width: 100%;

	padding: 24px;

	border: 1px solid #263047;
	border-radius: 16px;

	background:
		linear-gradient(
			145deg,
			rgba(20, 27, 43, 0.97),
			rgba(9, 13, 22, 0.97)
		);

	box-shadow:
		0 25px 80px rgba(0, 0, 0, 0.45),
		0 0 40px rgba(255, 64, 87, 0.04);
}

.home-card-header {
	display: flex;
	align-items: center;

	gap: 9px;

	margin-bottom: 22px;
}

.home-card-header h2 {
	margin: 0;

	color: #e9edf7;

	font-size: 13px;
	font-weight: 800;

	letter-spacing: 2px;

	text-transform: uppercase;
}

.home-field {
	display: flex;
	flex-direction: column;

	gap: 8px;

	margin-bottom: 16px;
}

.home-field > span {
	color: #65748e;

	font-size: 9px;
	font-weight: 900;

	letter-spacing: 2px;
}

.home-field input {
	width: 100%;

	padding: 12px 13px;

	outline: none;

	border: 1px solid #2a354c;
	border-radius: 8px;

	background: #0a0e17;

	color: #ffffff;

	font-size: 13px;

	transition:
		border-color 0.15s ease,
		box-shadow 0.15s ease;
}

.home-field input::placeholder {
	color: #3d485c;
}

.home-field input:focus {
	border-color:
		rgba(255, 64, 87, 0.65);

	box-shadow:
		0 0 0 3px
		rgba(255, 64, 87, 0.08);
}

.home-join-button {
	width: 100%;

	margin-top: 4px;
	padding: 12px;

	border: 0;
	border-radius: 8px;

	background:
		linear-gradient(
			135deg,
			#ff4057,
			#df2d45
		);

	color: #ffffff;

	font-size: 12px;
	font-weight: 900;

	letter-spacing: 1.5px;

	cursor: pointer;

	box-shadow:
		0 8px 25px
		rgba(255, 64, 87, 0.2);

	transition:
		transform 0.15s ease,
		box-shadow 0.15s ease,
		opacity 0.15s ease;
}

.home-join-button:hover:not(:disabled) {
	transform: translateY(-1px);

	box-shadow:
		0 12px 30px
		rgba(255, 64, 87, 0.3);
}

.home-join-button:disabled {
	opacity: 0.35;

	cursor: not-allowed;
}

.home-separator {
	display: grid;
	grid-template-columns: 1fr auto 1fr;
	align-items: center;

	gap: 12px;

	margin: 24px 0 16px;
}

.home-separator span {
	height: 1px;

	background: #20293c;
}

.home-separator p {
	margin: 0;

	color: #59677e;

	font-size: 8px;
	font-weight: 900;

	letter-spacing: 2px;
}

.home-controls {
	display: grid;
	grid-template-columns:
		repeat(2, 1fr);

	gap: 10px;
}

.home-controls > div {
	min-height: 50px;

	display: flex;
	align-items: center;

	gap: 6px;

	padding: 9px;

	border: 1px solid #202a3d;
	border-radius: 7px;

	background:
		rgba(8, 12, 20, 0.55);
}

.home-controls > div > span {
	margin-left: auto;

	color: #66758c;

	font-size: 8px;
	font-weight: 800;

	letter-spacing: 0.8px;
}

.home-footer {
	margin:
		18px
		0
		0;

	color: #384458;

	font-size: 9px;
	font-weight: 800;

	letter-spacing: 3px;
}

@media (max-width: 520px) {
	.home-page {
		padding: 20px;
	}

	.home-title {
		font-size: 36px;

		letter-spacing: 4px;
	}

	.home-card {
		padding: 20px;
	}

	.home-controls {
		grid-template-columns: 1fr;
	}
}
```

## `client/src/styles/ranking.css`

```css
.ranking-screen {
	width: 100%;
	max-width: 760px;

	display: flex;
	align-items: center;
	justify-content: center;

	animation:
		ranking-fade-in
		500ms ease;
}

.ranking-card {
	width: 100%;
	max-width: 520px;

	padding: 32px;

	border: 1px solid #263047;
	border-radius: 16px;

	background:
		linear-gradient(
			145deg,
			rgba(20, 27, 43, 0.98),
			rgba(9, 13, 22, 0.98)
		);
}

.ranking-eyebrow {
	margin: 0 0 8px;

	color: #65748e;

	font-size: 10px;
	font-weight: 900;

	letter-spacing: 3px;

	text-align: center;
}

.ranking-title {
	margin: 0 0 24px;

	color: #ffffff;

	font-size: 34px;
	font-weight: 900;

	letter-spacing: 5px;

	text-align: center;
}

.ranking-list {
	display: flex;
	flex-direction: column;

	gap: 10px;
}

.ranking-row {
	display: grid;

	grid-template-columns:
		52px
		1fr
		auto;

	align-items: center;

	gap: 12px;

	padding: 13px 14px;

	border: 1px solid #222c40;
	border-radius: 8px;

	background: #0a0e17;
}

.ranking-current {
	border-color:
		rgba(255, 64, 87, 0.45);

	background:
		rgba(255, 64, 87, 0.05);
}

.ranking-position {
	color: #ff4057;

	font-size: 13px;
	font-weight: 900;
}

.ranking-player {
	color: #e8edf6;

	font-size: 14px;
	font-weight: 800;
}

.ranking-host {
	padding: 3px 6px;

	border-radius: 4px;

	background:
		rgba(255, 205, 70, 0.13);

	color: #ffd257;

	font-size: 8px;
	font-weight: 900;
}

.ranking-actions {
	margin-top: 24px;
}

.ranking-restart-button {
	width: 100%;

	padding: 12px;

	border: 0;
	border-radius: 8px;

	background:
		linear-gradient(
			135deg,
			#ff4057,
			#df2d45
		);

	color: #ffffff;

	font-weight: 900;

	letter-spacing: 1.5px;

	cursor: pointer;

	transition:
		transform 0.15s ease,
		box-shadow 0.15s ease;
}

.ranking-restart-button:hover {
	transform: translateY(-1px);

	box-shadow:
		0 10px 25px
		rgba(255, 64, 87, 0.25);
}

.ranking-waiting {
	margin: 0;

	color: #65748e;

	font-size: 11px;
	font-weight: 800;

	letter-spacing: 2px;

	text-align: center;
}

@keyframes ranking-fade-in {
	from {
		opacity: 0;
		transform: translateY(8px);
	}

	to {
		opacity: 1;
		transform: translateY(0);
	}
}
```

## `client/src/utils/playerIdentity.js`

```javascript
const PLAYER_ID_KEY =
	"red-tetris-player-id";

export function getPlayerId() {
	let playerId =
		sessionStorage.getItem(
			PLAYER_ID_KEY
		);

	if (!playerId) {
		playerId =
			crypto.randomUUID();

		sessionStorage.setItem(
			PLAYER_ID_KEY,
			playerId
		);
	}

	return playerId;
}
```

## `client/vite.config.js`

```javascript
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
	plugins: [react()],

	server: {
		host: "0.0.0.0",
		port: 5173,

		proxy: {
			"/socket.io": {
				target: "http://localhost:3000",
				ws: true,
				changeOrigin: true
			}
		}
	}
});
```

## `package.json`

```json
{
  "name": "red-tetris",
  "version": "1.0.0",
  "description": "red-tetris 42",
  "private": true,
  "scripts": {
    "dev": "concurrently \"npm run dev --prefix server\" \"npm run dev --prefix client\"",
    "client": "npm run dev --prefix client",
    "server": "npm run dev --prefix server",
    "build": "npm run build --prefix client",
    "start": "npm run start --prefix server",
	"prod": "npm run build && npm run start",
    "test": "npm run test --prefix client && npm run test --prefix server"
  },
  "devDependencies": {
    "concurrently": "^9.2.4"
  }
}
```

## `server/package.json`

```json
{
  "name": "red-tetris-server",
  "version": "1.0.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "nodemon src/server.js",
    "start": "node src/server.js"
  },
  "dependencies": {
    "express": "^5.0.0",
    "socket.io": "^4.0.0"
  },
  "devDependencies": {
    "nodemon": "^3.0.0"
  }
}
```

## `server/src/app.js`

```javascript
import express from "express";

import path from "path";
import { fileURLToPath } from "url";

const app = express();

const __filename =
	fileURLToPath(import.meta.url);

const __dirname =
	path.dirname(__filename);

const clientDistPath =
	path.resolve(
		__dirname,
		"../../client/dist"
	);

app.get(
	"/health",
	(req, res) => {
		res.json({
			status: "ok"
		});
	}
);

app.use(
	express.static(
		clientDistPath
	)
);

/*
 * SPA fallback.
 *
 * Important for URLs such as:
 *
 * /test/eric
 *
 * If somebody refreshes this URL,
 * Node must return React's index.html.
 */
app.use((req, res, next) => {
	if (req.method !== "GET") {
		next();
		return;
	}

	res.sendFile(
		path.join(
			clientDistPath,
			"index.html"
		),
		(error) => {
			if (error)
				next(error);
		}
	);
});

export default app;
```

## `server/src/classes/Game.js`

```javascript
const TETRIMINOS = [
	"I",
	"O",
	"T",
	"S",
	"Z",
	"J",
	"L"
];

class Game {
	constructor(roomName) {
		this.roomName =
			roomName;

		/*
		 * Map:
		 *
		 * playerId -> Player
		 */
		this.players =
			new Map();

		/*
		 * hostId is now a PLAYER ID,
		 * not a socket ID.
		 */
		this.hostId =
			null;

		this.started =
			false;

		this.pieces =
			[];
	}

	addPlayer(player) {
		/*
		 * Already registered:
		 * update network connection.
		 */
		const existingPlayer =
			this.players.get(
				player.id
			);

		if (existingPlayer) {
			existingPlayer.reconnect(
				player.socketId
			);

			existingPlayer.name =
				player.name;

			return existingPlayer;
		}

		this.players.set(
			player.id,
			player
		);

		/*
		 * First player becomes host.
		 */
		if (
			this.hostId === null
		) {
			this.hostId =
				player.id;

			player.isHost =
				true;
		}

		return player;
	}

	removePlayer(playerId) {
		const player =
			this.players.get(
				playerId
			);

		if (!player)
			return;

		const wasHost =
			this.hostId ===
			playerId;

		this.players.delete(
			playerId
		);

		if (wasHost) {
			this.assignNewHost();
		}
	}

	assignNewHost() {
		/*
		 * Reset host flags first.
		 */
		for (
			const player
			of this.players.values()
		) {
			player.isHost =
				false;
		}

		const nextPlayer =
			this.players
				.values()
				.next()
				.value;

		if (!nextPlayer) {
			this.hostId =
				null;

			return;
		}

		this.hostId =
			nextPlayer.id;

		nextPlayer.isHost =
			true;
	}

	getPlayer(playerId) {
		return this.players.get(
			playerId
		);
	}

	findPlayerBySocket(
		socketId
	) {
		for (
			const player
			of this.players.values()
		) {
			if (
				player.socketId ===
				socketId
			) {
				return player;
			}
		}

		return null;
	}

	getPlayers() {
		return Array.from(
			this.players.values()
		);
	}

	generateBag() {
		const bag = [
			...TETRIMINOS
		];

		for (
			let i =
				bag.length - 1;
			i > 0;
			i--
		) {
			const j =
				Math.floor(
					Math.random() *
						(i + 1)
				);

			[
				bag[i],
				bag[j]
			] = [
				bag[j],
				bag[i]
			];
		}

		return bag;
	}

	generateSequence(
		bagCount = 20
	) {
		this.pieces = [];

		for (
			let i = 0;
			i < bagCount;
			i++
		) {
			const bag =
				this.generateBag();

			this.pieces.push(
				...bag
			);
		}
	}

	getNextPiece(player) {
		const piece =
			this.pieces[
				player.pieceIndex
			];

		if (!piece)
			return null;

		player.pieceIndex++;

		return piece;
	}

	peekNextPiece(player) {
		return (
			this.pieces[
				player.pieceIndex
			] ?? null
		);
	}
}

export default Game;
```

## `server/src/classes/Piece.js`

```javascript

```

## `server/src/classes/Player.js`

```javascript
class Player {
	constructor(
		playerId,
		socketId,
		name
	) {
		this.id = playerId;
		this.socketId = socketId;
		this.name = name;

		this.alive = true;
		this.pieceIndex = 0;
		this.spectrum = [];

		this.isHost = false;
	}

	reconnect(socketId) {
		this.socketId =
			socketId;
	}
}

export default Player;
```

## `server/src/managers/GameManager.js`

```javascript
import Game from "../classes/Game.js";

class GameManager {
	constructor() {
		this.games =
			new Map();
	}

	createGame(roomName) {
		const game =
			new Game(
				roomName
			);

		this.games.set(
			roomName,
			game
		);

		return game;
	}

	getGame(roomName) {
		return this.games.get(
			roomName
		);
	}

	getOrCreateGame(
		roomName
	) {
		let game =
			this.getGame(
				roomName
			);

		if (!game) {
			game =
				this.createGame(
					roomName
				);
		}

		return game;
	}

	removeGame(roomName) {
		this.games.delete(
			roomName
		);
	}

	findGameBySocket(
		socketId
	) {
		for (
			const game
			of this.games.values()
		) {
			if (
				game.findPlayerBySocket(
					socketId
				)
			) {
				return game;
			}
		}

		return null;
	}

	hasGame(roomName) {
		return this.games.has(
			roomName
		);
	}
}

export default GameManager;
```

## `server/src/protocol/events.js`

```javascript

```

## `server/src/server.js`

```javascript
import http from "http";

import {
	Server
} from "socket.io";

import app from "./app.js";

import Player from "./classes/Player.js";
import GameManager from "./managers/GameManager.js";

const PORT =
	process.env.PORT ||
	3000;

const DISCONNECT_GRACE_MS =
	3000;

const server =
	http.createServer(
		app
	);

const io =
	new Server(
		server
	);

const gameManager =
	new GameManager();

/*
 * playerId -> timeout
 */
const disconnectTimers =
	new Map();

function getDisconnectKey(
	room,
	playerId
) {
	return `${room}:${playerId}`;
}

function cancelDisconnect(
	room,
	playerId
) {
	const key =
		getDisconnectKey(
			room,
			playerId
		);

	const timeout =
		disconnectTimers.get(
			key
		);

	if (!timeout)
		return;

	clearTimeout(
		timeout
	);

	disconnectTimers.delete(
		key
	);
}

function buildRoomState(
	game
) {
	return {
		room:
			game.roomName,

		started:
			game.started,

		/*
		 * Player ID, not socket ID.
		 */
		hostId:
			game.hostId,

		players:
			game
				.getPlayers()
				.map(
					(player) => ({
						playerId:
							player.id,

						name:
							player.name,

						isHost:
							player.id ===
							game.hostId,

						alive:
							player.alive
					})
				)
	};
}

function emitRoomState(
	game
) {
	io.to(
		game.roomName
	).emit(
		"room:state",
		buildRoomState(
			game
		)
	);
}

io.on(
	"connection",
	(socket) => {
		console.log(
			`Player connected: ${socket.id}`
		);

		/*
		 * JOIN / RECONNECT
		 */
		socket.on(
			"room:join",
			({
				room,
				player,
				playerId
			}) => {
				if (
					!room ||
					!player ||
					!playerId
				) {
					return;
				}

				const game =
					gameManager
						.getOrCreateGame(
							room
						);

				const existingPlayer =
					game.getPlayer(
						playerId
					);

				/*
				 * A new player cannot join
				 * after game start.
				 *
				 * An existing player CAN
				 * reconnect.
				 */
				if (
					game.started &&
					!existingPlayer
				) {
					socket.emit(
						"room:error",
						{
							message:
								"Game already started"
						}
					);

					return;
				}

				cancelDisconnect(
					room,
					playerId
				);

				let roomPlayer;

				if (
					existingPlayer
				) {
					existingPlayer
						.reconnect(
							socket.id
						);

					existingPlayer.name =
						player;

					roomPlayer =
						existingPlayer;

					console.log(
						`Player ${player} reconnected to ${room}`
					);
				} else {
					roomPlayer =
						new Player(
							playerId,
							socket.id,
							player
						);

					game.addPlayer(
						roomPlayer
					);

					console.log(
						`Player ${player} joined room ${room}`
					);
				}

				socket.join(
					room
				);

				/*
				 * Store useful identity
				 * directly on the socket.
				 */
				socket.data.room =
					room;

				socket.data.playerId =
					playerId;

				emitRoomState(
					game
				);
			}
		);

		/*
		 * START GAME
		 */
		socket.on(
			"game:start",
			({ room }) => {
				const game =
					gameManager.getGame(
						room
					);

				if (!game)
					return;

				const player =
					game.findPlayerBySocket(
						socket.id
					);

				if (!player)
					return;

				if (
					game.hostId !==
					player.id
				) {
					return;
				}

				game.generateSequence();

				game.started =
					true;

				for (
					const roomPlayer
					of game.players.values()
				) {
					roomPlayer.alive =
						true;

					roomPlayer.pieceIndex =
						0;

					roomPlayer.spectrum =
						[];
				}

				emitRoomState(
					game
				);

				console.log(
					`Game ${room} started by ${player.name}`
				);
			}
		);

		/*
		 * NEXT PIECE
		 */
		socket.on(
			"piece:next",
			({ room }) => {
				const game =
					gameManager.getGame(
						room
					);

				if (!game)
					return;

				const player =
					game.findPlayerBySocket(
						socket.id
					);

				if (!player)
					return;

				const piece =
					game.getNextPiece(
						player
					);

				if (!piece)
					return;

				const nextPiece =
					game.peekNextPiece(
						player
					);

				socket.emit(
					"piece:next",
					{
						piece,
						nextPiece
					}
				);

				console.log(
					`Next piece for ${player.name}: ${piece} (index ${player.pieceIndex})`
				);
			}
		);

		/*
		 * SPECTRUM
		 */
		socket.on(
			"spectrum:update",
			({
				room,
				spectrum
			}) => {
				const game =
					gameManager.getGame(
						room
					);

				if (!game)
					return;

				const player =
					game.findPlayerBySocket(
						socket.id
					);

				if (!player)
					return;

				player.spectrum =
					spectrum;

				socket
					.to(room)
					.emit(
						"spectrum:update",
						{
							playerId:
								player.id,

							playerName:
								player.name,

							spectrum:
								player.spectrum
						}
					);
			}
		);

		/*
		 * RESTART
		 */
		socket.on(
			"game:restart",
			({ room }) => {
				const game =
					gameManager.getGame(
						room
					);

				if (!game)
					return;

				const player =
					game.findPlayerBySocket(
						socket.id
					);

				if (!player)
					return;

				/*
				 * Only host can restart.
				 */
				if (
					game.hostId !==
					player.id
				) {
					return;
				}

				game.generateSequence();

				game.started =
					true;

				for (
					const roomPlayer
					of game.players.values()
				) {
					roomPlayer.alive =
						true;

					roomPlayer.pieceIndex =
						0;

					roomPlayer.spectrum =
						[];
				}

				io.to(room).emit(
					"game:restart"
				);

				emitRoomState(
					game
				);

				console.log(
					`Game ${room} restarted by ${player.name}`
				);
			}
		);

		/*
		 * DISCONNECT
		 */
		socket.on(
			"disconnect",
			() => {
				const room =
					socket.data.room;

				const playerId =
					socket.data.playerId;

				if (
					!room ||
					!playerId
				) {
					console.log(
						`Player disconnected: ${socket.id}`
					);

					return;
				}

				const game =
					gameManager.getGame(
						room
					);

				if (!game)
					return;

				const player =
					game.getPlayer(
						playerId
					);

				if (!player)
					return;

				/*
				 * Important:
				 *
				 * If this player already
				 * reconnected with another
				 * socket, this old disconnect
				 * must do nothing.
				 */
				if (
					player.socketId !==
					socket.id
				) {
					return;
				}

				console.log(
					`Player ${player.name} disconnected, waiting for reconnect...`
				);

				const key =
					getDisconnectKey(
						room,
						playerId
					);

				const timeout =
					setTimeout(
						() => {
							disconnectTimers.delete(
								key
							);

							const currentGame =
								gameManager.getGame(
									room
								);

							if (!currentGame)
								return;

							const currentPlayer =
								currentGame.getPlayer(
									playerId
								);

							if (!currentPlayer)
								return;

							/*
							 * Player reconnected
							 * during grace period.
							 */
							if (
								currentPlayer.socketId !==
								socket.id
							) {
								return;
							}

							const wasHost =
								currentGame.hostId ===
								playerId;

							currentGame.removePlayer(
								playerId
							);

							if (
								currentGame
									.getPlayers()
									.length === 0
							) {
								gameManager.removeGame(
									room
								);

								console.log(
									`Room ${room} removed`
								);

								return;
							}

							emitRoomState(
								currentGame
							);

							if (wasHost) {
								console.log(
									`New host for ${room}: ${currentGame.hostId}`
								);
							}

							console.log(
								`Player ${playerId} removed from ${room}`
							);
						},
						DISCONNECT_GRACE_MS
					);

				disconnectTimers.set(
					key,
					timeout
				);
			}
		);
	}
);

server.listen(
	PORT,
	"0.0.0.0",
	() => {
		console.log(
			`Server running on port ${PORT}`
		);
	}
);
```

## `server/src/socket/connection.js`

```javascript

```

## `server/src/socket/gameHandlers.js`

```javascript

```

## `server/src/socket/playerHandlers.js`

```javascript

```

## `shared/constants.js`

```javascript

```

## `shared/events.js`

```javascript

```

