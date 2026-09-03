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
	board
}) {
	const [
		opponents,
		setOpponents
	] = useState({});

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

	useEffect(() => {
		const handleSpectrum =
			(data) => {
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
	}, []);

	return {
		opponents:
			Object.values(
				opponents
			)
	};
}

export default useMultiplayer;