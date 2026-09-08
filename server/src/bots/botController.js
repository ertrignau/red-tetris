import {
	TETRIMINOS
} from "../../../shared/constants.js";

import {
	getBotDifficulty
} from "./botDifficulty.js";

import {
	clearBotLines,
	hasBotCollision,
	lockBotPiece
} from "./botBoard.js";

import {
	evaluateBotBoard
} from "./botEvaluation.js";

function rotateShape(
	shape
) {
	const height =
		shape.length;

	const width =
		shape[0].length;

	const rotated =
		Array.from(
			{
				length:
					width
			},
			() =>
				Array(
					height
				).fill(
					0
				)
		);

	for (
		let y = 0;
		y < height;
		y++
	) {
		for (
			let x = 0;
			x < width;
			x++
		) {
			rotated[
				x
			][
				height - 1 - y
			] =
				shape[y][x];
		}
	}

	return rotated;
}

function getRotations(
	shape
) {
	const rotations =
		[];

	let current =
		shape;

	for (
		let i = 0;
		i < 4;
		i++
	) {
		const key =
			JSON.stringify(
				current
			);

		const alreadyExists =
			rotations.some(
				(rotation) =>
					JSON.stringify(
						rotation
					) ===
					key
			);

		if (
			!alreadyExists
		) {
			rotations.push(
				current
			);
		}

		current =
			rotateShape(
				current
			);
	}

	return rotations;
}

function findDropY(
	board,
	shape,
	x
) {
	let y =
		0;

	if (
		hasBotCollision(
			board,
			shape,
			x,
			y
		)
	) {
		return null;
	}

	while (
		!hasBotCollision(
			board,
			shape,
			x,
			y + 1
		)
	) {
		y++;
	}

	return y;
}

class BotController {
	constructor(bot) {
		this.bot =
			bot;
	}

	getConfig() {
		return getBotDifficulty(
			this.bot.difficulty
		);
	}

	findMoves(
		pieceType
	) {
		const shape =
			TETRIMINOS[
				pieceType
			];

		if (!shape)
			return [];

		const config =
			this.getConfig();

		const rotations =
			getRotations(
				shape
			);

		const moves =
			[];

		for (
			const rotation
			of rotations
		) {
			const width =
				rotation[0]
					.length;

			for (
				let x = 0;
				x <= 10 - width;
				x++
			) {
				const y =
					findDropY(
						this.bot.board,
						rotation,
						x
					);

				if (
					y === null
				) {
					continue;
				}

				const lockedBoard =
					lockBotPiece(
						this.bot.board,
						rotation,
						pieceType,
						x,
						y
					);

				const result =
					clearBotLines(
						lockedBoard
					);

				const score =
					evaluateBotBoard({
						board:
							result.board,

						clearedLines:
							result.clearedLines,

						weights:
							config.weights
					});

				moves.push({
					x,
					y,

					shape:
						rotation,

					board:
						result.board,

					clearedLines:
						result.clearedLines,

					score
				});
			}
		}

		return moves;
	}

	selectMove(
		moves
	) {
		if (
			moves.length ===
			0
		) {
			return null;
		}

		const config =
			this.getConfig();

		const sortedMoves = [
			...moves
		].sort(
			(a, b) =>
				b.score -
				a.score
		);

		if (
			Math.random() <
			config.errorRate
		) {
			const candidateCount =
				Math.min(
					3,
					sortedMoves.length
				);

			return sortedMoves[
				Math.floor(
					Math.random() *
						candidateCount
				)
			];
		}

		return sortedMoves[0];
	}

	chooseMove(
		pieceType
	) {
		const moves =
			this.findMoves(
				pieceType
			);

		return this.selectMove(
			moves
		);
	}
}

export default BotController;