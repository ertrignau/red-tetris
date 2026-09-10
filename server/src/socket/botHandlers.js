import {
	randomUUID
} from "crypto";

import BotPlayer
	from "../bots/botPlayer.js";

import {
	BOT_PROFILES
} from "../bots/botProfiles.js";

import {
	emitRoomState
} from "../services/roomState.js";

import {
	MAX_PLAYERS
} from "../../../shared/constants.js";

import {
	activeBots
} from "../metrics/metrics.js";

function updateActiveBots(
	gameManager
) {
	let count = 0;

	for (
		const game
		of gameManager.games.values()
	) {
		count +=
			game.getPlayers()
				.filter(
					(player) =>
						player.isBot
				)
				.length;
	}

	activeBots.set(
		count
	);
}

function getAvailableProfile(
	game
) {
	const usedNames =
		new Set(
			game
				.getPlayers()
				.map(
					(player) =>
						player.name
				)
		);

	const availableProfiles =
		BOT_PROFILES.filter(
			(profile) =>
				!usedNames.has(
					profile.name
				)
		);

	const pool =
		availableProfiles.length > 0
			? availableProfiles
			: BOT_PROFILES;

	return pool[
		Math.floor(
			Math.random() *
				pool.length
		)
	];
}

export function registerBotHandlers({
	io,
	socket,
	gameManager
}) {
	socket.on(
		"bot:add",
		({ room }) => {
			const game =
				gameManager.getGame(
					room
				);

			if (
				!game ||
				game.started
			) {
				return;
			}

			const player =
				game.findPlayerBySocket(
					socket.id
				);

			if (
				!player ||
				game.hostId !==
					player.id
			) {
				return;
			}

			if (
				game.getPlayers().length >=
				MAX_PLAYERS
			) {
				socket.emit(
					"room:error",
					{
						message:
							"Room is full"
					}
				);

				return;
			}

			const profile =
				getAvailableProfile(
					game
				);

			const bot =
				new BotPlayer({
					playerId:
						`bot-${randomUUID()}`,

					name:
						profile.name,

					difficulty:
						profile.difficulty
				});

			game.addPlayer(
				bot
			);

			updateActiveBots(
				gameManager
			);

			emitRoomState(
				io,
				game
			);

			console.log(
				`Bot ${bot.name} added to ${room}`
			);
		}
	);

	socket.on(
		"bot:remove",
		({
			room,
			botId
		}) => {
			const game =
				gameManager.getGame(
					room
				);

			if (
				!game ||
				game.started
			) {
				return;
			}

			const player =
				game.findPlayerBySocket(
					socket.id
				);

			if (
				!player ||
				game.hostId !==
					player.id
			) {
				return;
			}

			const bot =
				game.getPlayer(
					botId
				);

			if (
				!bot ||
				!bot.isBot
			) {
				return;
			}

			game.removePlayer(
				bot.id
			);

			updateActiveBots(
				gameManager
			);

			emitRoomState(
				io,
				game
			);

			console.log(
				`Bot ${bot.name} removed from ${room}`
			);
		}
	);
}