export const BOT_DIFFICULTIES = {
	easy: {
		thinkDelay: 1200,

		errorRate: 0.45,

		weights: {
			lines: 1,
			holes: -1,
			height: -0.4,
			bumpiness: -0.2
		}
	},

	medium: {
		thinkDelay: 800,

		errorRate: 0.2,

		weights: {
			lines: 2,
			holes: -3,
			height: -1,
			bumpiness: -0.8
		}
	},

	hard: {
		thinkDelay: 450,

		errorRate: 0.05,

		weights: {
			lines: 4,
			holes: -7,
			height: -2,
			bumpiness: -1.5
		}
	},

	expert: {
		thinkDelay: 250,

		errorRate: 0,

		weights: {
			lines: 6,
			holes: -10,
			height: -3,
			bumpiness: -2
		}
	}
};

export function getBotDifficulty(
	difficulty
) {
	return (
		BOT_DIFFICULTIES[
			difficulty
		] ??
		BOT_DIFFICULTIES.medium
	);
}