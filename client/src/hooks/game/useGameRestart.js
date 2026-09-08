import {
	useCallback,
	useEffect
} from "react";

import socket from "../../socket/socket.js";

function useGameRestart({
	room,
	isHost,

	resetGameState,
	resetRanking,
	resetCountdown,
	resetSession,

	setCurrentPiece,
	setNextPiece
}) {
	const resetClient =
		useCallback(
			() => {
				resetGameState();

				resetRanking();

				resetCountdown();

				resetSession();

				setCurrentPiece(
					null
				);

				setNextPiece(
					null
				);
			},
			[
				resetGameState,
				resetRanking,
				resetCountdown,
				resetSession,
				setCurrentPiece,
				setNextPiece
			]
		);

	const handleRestart =
		useCallback(
			() => {
				if (!isHost)
					return;

				socket.emit(
					"game:restart",
					{
						room
					}
				);
			},
			[
				isHost,
				room
			]
		);

	useEffect(() => {
		const onGameRestart =
			() => {
				resetClient();
			};

		socket.on(
			"game:restart",
			onGameRestart
		);

		return () => {
			socket.off(
				"game:restart",
				onGameRestart
			);
		};
	}, [
		resetClient
	]);

	return {
		handleRestart,
		resetClient
	};
}

export default useGameRestart;