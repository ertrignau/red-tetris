import PlayerList
	from "../PlayerList/PlayerList.jsx";

import GameStatus
	from "../GameStatus/GameStatus.jsx";

import GameSidePanel
	from "../GameSidePanel/GameSidePanel.jsx";

function GameLayout({
	roomState,

	player,
	playerId,
	error,

	isHost,

	onStart,
	onModeChange,
	onAddBot,
	onRemoveBot,

	showBoard,
	isFinishing,

	board,
	currentPiece,
	gameOver,
	score,
	countdown,

	nextPiece,
	opponents
}) {
	return (
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
					onStart
				}

				mode={
					roomState?.mode
				}

				onModeChange={
					onModeChange
				}

				onAddBot={
					onAddBot
				}

				onRemoveBot={
					onRemoveBot
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

			<GameSidePanel
				score={
					score
				}

				nextPiece={
					nextPiece
				}

				opponents={
					opponents
				}
			/>
		</div>
	);
}

export default GameLayout;