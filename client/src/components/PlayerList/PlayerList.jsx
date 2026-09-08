import {
	MAX_PLAYERS
} from "../../../../shared/constants.js";

function PlayerList({
	roomState,
	player,
	playerId,
	error,
	isHost,
	onStart,
	mode,
	onModeChange,
	onAddBot,
	onRemoveBot
}) {
	const hasMultiplePlayers =
		(
			roomState
				?.players
				?.length ??
			0
		) > 1;

	const playerCount =
		roomState?.players?.length ?? 0;

	const roomIsFull =
		playerCount >= MAX_PLAYERS;

	const modeLabel =
		mode === "points"
			? "POINTS"
			: "BATTLE ROYALE";

	return (
		<aside className="game-panel players-panel">
			<div className="panel-header">
				<span className="panel-dot"></span>

				<h2>
					Players
				</h2>

				<span
					className={
						roomIsFull
							? "player-count player-count-full"
							: "player-count"
					}
				>
					{playerCount}/{MAX_PLAYERS}
				</span>
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
									{roomPlayer.name}
								</span>

								{roomPlayer.isBot && (
									<span className="bot-badge">
										BOT
									</span>
								)}

								{roomPlayer.isHost && (
									<span className="host-badge">
										HOST
									</span>
								)}

								{isHost &&
								roomPlayer.isBot &&
								!roomState.started && (
									<button
										type="button"
										className="remove-bot-button"
										onClick={() =>
											onRemoveBot(
												roomPlayer.playerId
											)
										}
										title="Remove bot"
									>
										×
									</button>
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

			{roomIsFull &&
			!roomState?.started && (
				<div className="room-full-message">
					ROOM FULL
				</div>
			)}

			{isHost &&
			!roomState?.started && (
				<button
					type="button"
					className="add-bot-button"
					onClick={
						onAddBot
					}
					disabled={
						roomIsFull
					}
				>
					{roomIsFull
						? "MAX PLAYERS"
						: "+ ADD BOT"}
				</button>
			)}

			{hasMultiplePlayers && (
				<div className="game-mode-block">
					<span className="game-mode-label">
						GAME MODE
					</span>

					{isHost &&
					!roomState?.started ? (
						<div className="game-mode-buttons">
							<button
								type="button"
								className={
									mode ===
									"battle-royale"
										? "mode-button mode-active"
										: "mode-button"
								}
								onClick={() =>
									onModeChange(
										"battle-royale"
									)
								}
							>
								BATTLE ROYALE
							</button>

							<button
								type="button"
								className={
									mode ===
									"points"
										? "mode-button mode-active"
										: "mode-button"
								}
								onClick={() =>
									onModeChange(
										"points"
									)
								}
							>
								POINTS
							</button>
						</div>
					) : (
						<strong className="game-mode-value">
							{modeLabel}
						</strong>
					)}
				</div>
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