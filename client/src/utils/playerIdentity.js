const PLAYER_ID_KEY =
	"red-tetris-player-id";

function generatePlayerId() {
	if (
		globalThis.crypto &&
		typeof globalThis.crypto.randomUUID ===
			"function"
	) {
		return globalThis.crypto.randomUUID();
	}

	return [
		Date.now().toString(36),
		Math.random()
			.toString(36)
			.slice(2),
		Math.random()
			.toString(36)
			.slice(2)
	].join("-");
}

export function getPlayerId() {
	let playerId =
		sessionStorage.getItem(
			PLAYER_ID_KEY
		);

	if (!playerId) {
		playerId =
			generatePlayerId();

		sessionStorage.setItem(
			PLAYER_ID_KEY,
			playerId
		);
	}

	return playerId;
}