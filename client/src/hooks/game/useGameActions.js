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

	const handleAddBot =
		useCallback(
			() => {
				if (
					!isHost ||
					roomState?.started
				) {
					return;
				}

				socket.emit(
					"bot:add",
					{
						room
					}
				);
			},
			[
				room,
				isHost,
				roomState?.started
			]
		);

	const handleRemoveBot =
		useCallback(
			(botId) => {
				if (
					!isHost ||
					roomState?.started
				) {
					return;
				}

				socket.emit(
					"bot:remove",
					{
						room,
						botId
					}
				);
			},
			[
				room,
				isHost,
				roomState?.started
			]
		);

	return {
		handleModeChange,
		handleStart,
		handleAddBot,
		handleRemoveBot
	};
}

export default useGameActions;