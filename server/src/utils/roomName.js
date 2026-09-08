export function generateMatchmakingRoom() {
	return `match-${Math.random()
		.toString(36)
		.slice(2, 10)}`;
}