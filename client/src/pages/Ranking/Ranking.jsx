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