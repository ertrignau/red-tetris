function GameHeader({
	room
}) {
	return (
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
	);
}

export default GameHeader;