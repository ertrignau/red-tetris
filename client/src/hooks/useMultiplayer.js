import {
	useEffect,
	useState
} from "react";

import socket from "../socket/socket.js";

import {
	calculateSpectrum
} from "../game/spectrum.js";

function useMultiplayer({
	room,
	started,
	board,
	roomState,
	playerId
}) {
	const [
		opponents,
		setOpponents
	] = useState({});

	/*
	 * Send our spectrum while
	 * the game is running.
	 */
	useEffect(() => {
		if (!started)
			return;

		const spectrum =
			calculateSpectrum(
				board
			);

		socket.emit(
			"spectrum:update",
			{
				room,
				spectrum
			}
		);
	}, [
		room,
		started,
		board
	]);

	/*
	 * Receive opponents spectra.
	 */
	useEffect(() => {
		const handleSpectrum =
			(data) => {
				if (
					data.playerId ===
					playerId
				) {
					return;
				}

				setOpponents(
					(current) => ({
						...current,

						[data.playerId]: {
							id:
								data.playerId,

							name:
								data.playerName,

							spectrum:
								data.spectrum
						}
					})
				);
			};

		socket.on(
			"spectrum:update",
			handleSpectrum
		);

		return () => {
			socket.off(
				"spectrum:update",
				handleSpectrum
			);
		};
	}, [
		playerId
	]);

	/*
	 * Remove players that are no
	 * longer present in the room.
	 *
	 * Without this, an opponent
	 * spectrum stays displayed
	 * forever after disconnect.
	 */
	useEffect(() => {
		if (
			!roomState?.players
		) {
			return;
		}

		const activePlayerIds =
			new Set(
				roomState.players
					.map(
						(player) =>
							player.playerId
					)
					.filter(
						(id) =>
							id !==
							playerId
					)
			);

		setOpponents(
			(current) => {
				const next = {};

				for (
					const [
						id,
						opponent
					]
					of Object.entries(
						current
					)
				) {
					if (
						activePlayerIds.has(
							id
						)
					) {
						next[id] =
							opponent;
					}
				}

				return next;
			}
		);
	}, [
		roomState?.players,
		playerId
	]);

	/*
	 * Clear stale spectra when
	 * returning to lobby.
	 */
	useEffect(() => {
		if (started)
			return;

		setOpponents(
			{}
		);
	}, [
		started
	]);

	return {
		opponents:
			Object.values(
				opponents
			)
	};
}

export default useMultiplayer;