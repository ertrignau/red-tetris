const SCORE_TABLE = {
	0: 0,
	1: 100,
	2: 300,
	3: 500,
	4: 800
};

export function calculateScore(clearedLines) {
	return SCORE_TABLE[clearedLines] ?? 0;
}