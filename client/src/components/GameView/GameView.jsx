import GameHeader
	from "../GameHeader/GameHeader.jsx";

import GameLayout
	from "../GameLayout/GameLayout.jsx";

import Ranking
	from "../../pages/Ranking/Ranking.jsx";

function GameView({
	room,
	player,
	game
}) {
	const {
		playerId,
		roomState,
		error,
		isHost,

		board,
		score,
		gameOver,

		currentPiece,
		nextPiece,

		countdown,
		showBoard,

		opponents,

		showRanking,
		isFading,
		isFinishing,
		ranking,
		finishedMode,

		handleStart,
		handleModeChange,
		handleRestart,
		handleAddBot,
		handleRemoveBot
	} = game;

	return (
		<main className="game-page">
			<GameHeader
				room={
					room
				}
			/>

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
				<GameLayout
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

					onModeChange={
						handleModeChange
					}

					onAddBot={
						handleAddBot
					}

					onRemoveBot={
						handleRemoveBot
					}

					showBoard={
						showBoard
					}

					isFinishing={
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

					nextPiece={
						nextPiece
					}

					opponents={
						opponents
					}
				/>
			)}

			{isFading && (
				<div className="ranking-fade-overlay" />
			)}
		</main>
	);
}

export default GameView;