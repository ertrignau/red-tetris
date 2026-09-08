import {
	createDisconnectTimers
} from "../services/disconnectTimers.js";

import BotRunner
	from "../bots/botRunner.js";

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

import {
	registerBotHandlers
} from "./botHandlers.js";

export function registerSocketHandlers({
	io,
	gameManager
}) {
	const disconnectTimers =
		createDisconnectTimers();

	const botRunner =
		new BotRunner({
			io
		});

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
				gameManager,
				botRunner
			});

			registerPieceHandlers({
				socket,
				gameManager
			});

			registerPenaltyHandlers({
				io,
				socket,
				gameManager,
				botRunner
			});

			registerSpectrumHandlers({
				socket,
				gameManager
			});

			registerBotHandlers({
				io,
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