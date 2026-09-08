import {
	useCallback
} from "react";

import socket from "../../socket/socket.js";

function useGameActions({
	room,
	roomState,
	isHost,
	resetClient
}) {
	const handleModeChange =
		useCallback(
			(mode) => {
				if (
					!isHost ||
					roomState?.started ||
					(
						roomState
							?.players
							?.length ??
						0
					) <= 1
				) {
					return;
				}

				socket.emit(
					"game:mode",
					{
						room,
						mode
					}
				);
			},
			[
				room,
				isHost,
				roomState?.started,
				roomState?.players
			]
		);

	const handleStart =
		useCallback(
			() => {
				if (
					!isHost ||
					roomState?.started
				) {
					return;
				}

				/*
				 * Clean local state before
				 * starting a new server round.
				 */
				resetClient();

				socket.emit(
					"game:start",
					{
						room
					}
				);
			},
			[
				room,
				isHost,
				roomState?.started,
				resetClient
			]
		);

	return {
		handleModeChange,
		handleStart
	};
}

export default useGameActions;