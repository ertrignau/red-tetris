import BotController
	from "./botController.js";

import {
	getBotDifficulty
} from "./botDifficulty.js";

import {
	addBotPenaltyLines,
	calculateBotSpectrum
} from "./botBoard.js";

import {
	emitRoomState
} from "../services/roomState.js";

import {
	finishGame
} from "../services/gameResult.js";

const SCORE_TABLE = {
	0: 0,
	1: 100,
	2: 300,
	3: 500,
	4: 800
};

function calculateScore(
	lines
) {
	return (
		SCORE_TABLE[
			lines
		] ?? 0
	);
}

class BotRunner {
	constructor({
		io
	}) {
		this.io =
			io;

		this.timers =
			new Map();
	}

	getTimerKey(
		game,
		bot
	) {
		return (
			`${game.roomName}:${bot.id}`
		);
	}

	clearTimer(
		game,
		bot
	) {
		const key =
			this.getTimerKey(
				game,
				bot
			);

		const timer =
			this.timers.get(
				key
			);

		if (!timer)
			return;

		clearTimeout(
			timer
		);

		this.timers.delete(
			key
		);
	}

	startGame(
		game
	) {
		for (
			const player
			of game.players.values()
		) {
			if (
				!player.isBot
			) {
				continue;
			}

			this.scheduleTurn(
				game,
				player,
				true
			);
		}
	}

	scheduleTurn(
		game,
		bot,
		firstTurn = false
	) {
		this.clearTimer(
			game,
			bot
		);

		if (
			!game.started ||
			!bot.alive
		) {
			return;
		}

		const config =
			getBotDifficulty(
				bot.difficulty
			);

		let delay =
			config.thinkDelay;

		if (
			firstTurn &&
			game.countdownEndsAt
		) {
			const countdownDelay =
				Math.max(
					0,
					game.countdownEndsAt -
						Date.now()
				);

			delay +=
				countdownDelay;
		}

		const key =
			this.getTimerKey(
				game,
				bot
			);

		const timer =
			setTimeout(
				() => {
					this.timers.delete(
						key
					);

					this.playTurn(
						game,
						bot
					);
				},
				delay
			);

		this.timers.set(
			key,
			timer
		);
	}

	playTurn(
		game,
		bot
	) {
		if (
			!game.started ||
			!bot.alive ||
			!game.getPlayer(
				bot.id
			)
		) {
			return;
		}

		const pieceType =
			game.getNextPiece(
				bot
			);

		if (!pieceType) {
			this.killBot(
				game,
				bot
			);

			return;
		}

		const controller =
			new BotController(
				bot
			);

		const move =
			controller.chooseMove(
				pieceType
			);

		if (!move) {
			this.killBot(
				game,
				bot
			);

			return;
		}

		bot.board =
			move.board;

		if (
			move.clearedLines >
			0
		) {
			bot.score +=
				calculateScore(
					move.clearedLines
				);
		}

		bot.spectrum =
			calculateBotSpectrum(
				bot.board
			);

		this.emitSpectrum(
			game,
			bot
		);

		/*
		 * Same mandatory rule as
		 * human players:
		 *
		 * N cleared lines =>
		 * N - 1 penalty lines.
		 */
		if (
			move.clearedLines >
			1
		) {
			this.sendPenalty(
				game,
				bot,
				move.clearedLines -
					1
			);
		}

		emitRoomState(
			this.io,
			game
		);

		this.scheduleTurn(
			game,
			bot
		);
	}

	emitSpectrum(
		game,
		bot
	) {
		this.io.to(
			game.roomName
		).emit(
			"spectrum:update",
			{
				playerId:
					bot.id,

				playerName:
					bot.name,

				spectrum:
					bot.spectrum
			}
		);
	}

	applyPenalty(
		game,
		bot,
		count,
		from = null
	) {
		if (
			!game.started ||
			!bot.alive
		) {
			return;
		}

		const penaltyCount =
			Math.max(
				0,
				Math.min(
					3,
					Math.floor(
						Number(
							count
						) || 0
					)
				)
			);

		if (
			penaltyCount === 0
		) {
			return;
		}

		bot.board =
			addBotPenaltyLines(
				bot.board,
				penaltyCount
			);

		bot.spectrum =
			calculateBotSpectrum(
				bot.board
			);

		this.emitSpectrum(
			game,
			bot
		);

		console.log(
			`Bot ${bot.name} received ${penaltyCount} penalty line(s)` +
			(
				from
					? ` from ${from}`
					: ""
			)
		);
	}

	sendPenalty(
		game,
		attacker,
		count
	) {
		const penaltyCount =
			Math.max(
				0,
				Math.min(
					3,
					Math.floor(
						Number(
							count
						) || 0
					)
				)
			);

		if (
			penaltyCount === 0
		) {
			return;
		}

		for (
			const target
			of game.players.values()
		) {
			if (
				target.id ===
					attacker.id ||
				!target.alive
			) {
				continue;
			}

			if (
				target.isBot
			) {
				this.applyPenalty(
					game,
					target,
					penaltyCount,
					attacker.name
				);

				continue;
			}

			if (
				target.socketId
			) {
				this.io.to(
					target.socketId
				).emit(
					"penalty:add",
					{
						count:
							penaltyCount,

						from:
							attacker.name
					}
				);
			}
		}

		console.log(
			`Bot ${attacker.name} sent ${penaltyCount} penalty line(s)`
		);
	}

	killBot(
		game,
		bot
	) {
		if (
			!bot.alive
		) {
			return;
		}

		this.clearTimer(
			game,
			bot
		);

		game.markPlayerDead(
			bot.id
		);

		console.log(
			`Bot ${bot.name} finished with ${bot.score} points`
		);

		emitRoomState(
			this.io,
			game
		);

		this.resolveGame(
			game
		);
	}

	resolveGame(
		game
	) {
		if (
			!game.started
		) {
			return;
		}

		if (
			game.activeMode ===
			"battle-royale"
		) {
			const alivePlayers =
				game.getAlivePlayers();

			if (
				alivePlayers.length >
				1
			) {
				return;
			}

			const winner =
				alivePlayers[0];

			finishGame(
				this.io,
				game,
				[
					...(winner
						? [winner]
						: []),

					...game.getRanking()
				]
			);

			return;
		}

		if (
			game.activeMode ===
			"points"
		) {
			if (
				!game.isFinished()
			) {
				return;
			}

			finishGame(
				this.io,
				game,
				game.getPointsRanking()
			);

			return;
		}

		if (
			game.isFinished()
		) {
			finishGame(
				this.io,
				game,
				game.getRanking()
			);
		}
	}
}

export default BotRunner;