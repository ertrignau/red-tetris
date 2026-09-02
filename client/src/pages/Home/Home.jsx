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