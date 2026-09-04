function Ranking({
	players,
	currentPlayerId,
	isHost,
	onRestart,
	mode
}) {
	const modeLabel =
		mode === "battle-royale"
			? "BATTLE ROYALE"
			: mode === "points"
				? "POINTS"
				: "SOLO";

	return (
		<section className="ranking-screen">
			<div className="ranking-card">
				<p className="ranking-eyebrow">
					MATCH COMPLETE
				</p>

				<h2 className="ranking-title">
					RANKING
				</h2>

				<div className="ranking-mode">
					<span className="ranking-mode-label">
						MODE
					</span>

					<strong className="ranking-mode-value">
						{modeLabel}
					</strong>
				</div>

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
									{player.name}
								</span>

								{mode === "points" && (
									<span className="ranking-score">
										{player.score ?? 0}
									</span>
								)}

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