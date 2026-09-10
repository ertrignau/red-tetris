export const BOT_PROFILES = [
	{
		name: "NoobTetris",
		difficulty: "easy"
	},
	{
		name: "BabyBlock",
		difficulty: "easy"
	},
	{
		name: "ImScarred",
		difficulty: "easy"
	},
	{
		name: "PanicPiece",
		difficulty: "easy"
	},

	{
		name: "Harry Botteur",
		difficulty: "medium"
	},
	{
		name: "Blocky Balboa",
		difficulty: "medium"
	},
	{
		name: "Stack Attack",
		difficulty: "medium"
	},
	{
		name: "TetriScout",
		difficulty: "medium"
	},

	{
		name: "DarkSoultris",
		difficulty: "hard"
	},
	{
		name: "LineHunter",
		difficulty: "hard"
	},
	{
		name: "Magnus Carlsen",
		difficulty: "hard"
	},
	{
		name: "Tetromancer",
		difficulty: "hard"
	},

	{
		name: "Tron",
		difficulty: "expert"
	},
	{
		name: "VoidStacker",
		difficulty: "expert"
	},
	{
		name: "PerfectClear",
		difficulty: "expert"
	},
	{
		name: "TetrisPrime",
		difficulty: "expert"
	}
];

export function getRandomBotProfile() {
	return BOT_PROFILES[
		Math.floor(
			Math.random() *
			BOT_PROFILES.length
		)
	];
}