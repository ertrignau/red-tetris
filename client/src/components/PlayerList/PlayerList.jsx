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
						type="button"
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