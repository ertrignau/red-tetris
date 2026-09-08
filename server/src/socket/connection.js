import {
	createDisconnectTimers
} from "../services/disconnectTimers.js";

import {
	registerRoomHandlers
} from "./roomHandlers.js";

import {
	registerMatchmakingHandlers
} from "./matchmakingHandlers.js";

import {
	registerGameHandlers
} from "./gameHandlers.js";

import {
	registerPieceHandlers
} from "./pieceHandlers.js";

import {
	registerPenaltyHandlers
} from "./penaltyHandlers.js";

import {
	registerSpectrumHandlers
} from "./spectrumHandlers.js";

import {
	registerDisconnectHandlers
} from "./disconnectHandlers.js";

export function registerSocketHandlers({
	io,
	gameManager
}) {
	const disconnectTimers =
		createDisconnectTimers();

	io.on(
		"connection",
		(socket) => {
			console.log(
				`Player connected: ${socket.id}`
			);

			registerRoomHandlers({
				io,
				socket,
				gameManager,
				disconnectTimers
			});

			registerMatchmakingHandlers({
				io,
				socket,
				gameManager,
				disconnectTimers
			});

			registerGameHandlers({
				io,
				socket,
				gameManager
			});

			registerPieceHandlers({
				socket,
				gameManager
			});

			registerPenaltyHandlers({
				io,
				socket,
				gameManager
			});

			registerSpectrumHandlers({
				socket,
				gameManager
			});

			registerDisconnectHandlers({
				io,
				socket,
				gameManager,
				disconnectTimers
			});
		}
	);
}