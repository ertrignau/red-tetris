import {
	useEffect,
	useState
} from "react";

import {
	useNavigate
} from "react-router-dom";

import socket from "../../socket/socket.js";

import {
	getPlayerId
} from "../../utils/playerIdentity.js";

const USERNAME_MIN_LENGTH = 3;
const USERNAME_MAX_LENGTH = 16;

const ROOM_MIN_LENGTH = 3;
const ROOM_MAX_LENGTH = 20;

const ROOM_REGEX =
	/^[a-zA-Z0-9_-]+$/;

function Home() {
	const navigate =
		useNavigate();

	const [
		player,
		setPlayer
	] = useState("");

	const [
		room,
		setRoom
	] = useState("");

	const [
		error,
		setError
	] = useState("");

	const [
		matchmaking,
		setMatchmaking
	] = useState(false);

	const [
		playerId
	] = useState(
		() => getPlayerId()
	);

	useEffect(() => {
		const onMatchFound =
			({
				room: foundRoom
			}) => {
				setMatchmaking(
					false
				);

				setError(
					""
				);

				navigate(
					`/${encodeURIComponent(foundRoom)}/${encodeURIComponent(player.trim())}`
				);
			};

		const onMatchmakingError =
			(data) => {
				setMatchmaking(
					false
				);

				setError(
					data.message ??
						"Matchmaking error"
				);
			};

		socket.on(
			"matchmaking:found",
			onMatchFound
		);

		socket.on(
			"matchmaking:error",
			onMatchmakingError
		);

		return () => {
			socket.off(
				"matchmaking:found",
				onMatchFound
			);

			socket.off(
				"matchmaking:error",
				onMatchmakingError
			);
		};
	}, [
		navigate,
		player
	]);

	const validatePlayer =
		() => {
			const cleanPlayer =
				player.trim();

			if (
				cleanPlayer.length <
					USERNAME_MIN_LENGTH ||
				cleanPlayer.length >
					USERNAME_MAX_LENGTH
			) {
				setError(
					`Player name must be between ${USERNAME_MIN_LENGTH} and ${USERNAME_MAX_LENGTH} characters`
				);

				return null;
			}

			return cleanPlayer;
		};

	const handleSubmit =
		(event) => {
			event.preventDefault();

			const cleanPlayer =
				validatePlayer();

			if (!cleanPlayer)
				return;

			const cleanRoom =
				room.trim();

			if (
				cleanRoom.length <
					ROOM_MIN_LENGTH ||
				cleanRoom.length >
					ROOM_MAX_LENGTH
			) {
				setError(
					`Room name must be between ${ROOM_MIN_LENGTH} and ${ROOM_MAX_LENGTH} characters`
				);

				return;
			}

			if (
				!ROOM_REGEX.test(
					cleanRoom
				)
			) {
				setError(
					"Room can only contain letters, numbers, - and _"
				);

				return;
			}

			setError(
				""
			);

			navigate(
				`/${encodeURIComponent(cleanRoom)}/${encodeURIComponent(cleanPlayer)}`
			);
		};

	const handleMatchmaking =
		() => {
			const cleanPlayer =
				validatePlayer();

			if (!cleanPlayer)
				return;

			setError(
				""
			);

			setMatchmaking(
				true
			);

			socket.emit(
				"matchmaking:join",
				{
					player:
						cleanPlayer,

					playerId
				}
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
						<span>
							RED
						</span>{" "}
						TETRIS
					</h1>

					<p className="home-subtitle">
						Join a room. Clear lines. Survive.
					</p>
				</header>

				<form
					className="home-card"
					onSubmit={
						handleSubmit
					}
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
							value={
								player
							}
							onChange={
								(event) => {
									setPlayer(
										event.target.value
									);

									setError(
										""
									);
								}
							}
							placeholder="Eric"
							maxLength={
								USERNAME_MAX_LENGTH
							}
							autoComplete="off"
						/>
					</label>

					<label className="home-field">
						<span>
							ROOM
						</span>

						<input
							type="text"
							value={
								room
							}
							onChange={
								(event) => {
									setRoom(
										event.target.value
									);

									setError(
										""
									);
								}
							}
							placeholder="test"
							maxLength={
								ROOM_MAX_LENGTH
							}
							autoComplete="off"
						/>
					</label>

					{error && (
						<div className="home-error">
							{error}
						</div>
					)}

					<button
						className="home-join-button"
						type="submit"
						disabled={
							!player.trim() ||
							!room.trim() ||
							matchmaking
						}
					>
						JOIN GAME
					</button>

					<button
						className="home-matchmaking-button"
						type="button"
						onClick={
							handleMatchmaking
						}
						disabled={
							!player.trim() ||
							matchmaking
						}
					>
						<span className="matchmaking-dot"></span>

						{matchmaking
							? "SEARCHING FOR GAME"
							: "FIND MATCH"}
					</button>

					<div className="home-separator">
						<span></span>

						<p>
							CONTROLS
						</p>

						<span></span>
					</div>

					<div className="home-controls">
						<div>
							<kbd>
								←
							</kbd>

							<kbd>
								→
							</kbd>

							<span>
								MOVE
							</span>
						</div>

						<div>
							<kbd>
								↑
							</kbd>

							<span>
								ROTATE
							</span>
						</div>

						<div>
							<kbd>
								↓
							</kbd>

							<span>
								DROP
							</span>
						</div>

						<div>
							<kbd>
								SPACE
							</kbd>

							<span>
								HARD DROP
							</span>
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