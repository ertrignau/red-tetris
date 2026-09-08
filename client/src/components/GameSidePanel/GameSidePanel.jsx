import GamePanel from "../GamePanel/GamePanel.jsx";
import Opponent from "../Opponent/Opponent.jsx";

function GameSidePanel({
	score,
	nextPiece,
	opponents
}) {
	return (
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
	);
}

export default GameSidePanel;