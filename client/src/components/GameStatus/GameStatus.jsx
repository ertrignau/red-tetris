import Board from "../Board/Board.jsx";

function GameStatus({
	started,
	finishing,
	board,
	currentPiece,
	gameOver,
	score,
	countdown
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
					: finishing
						? "MATCH COMPLETE"
						: countdown
							? "GET READY"
							: started
								? "GAME IN PROGRESS"
								: "WAITING FOR HOST"}
			</div>

			<div className="board-frame">
				{started ? (
					<>
						<Board
							board={
								board
							}
							piece={
								currentPiece
							}
						/>

						{countdown && (
							<div className="countdown-overlay">
								<span className="countdown-ready">
									GET READY
								</span>

								<strong className="countdown-value">
									{countdown}
								</strong>
							</div>
						)}

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