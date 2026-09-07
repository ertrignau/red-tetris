function getGameSessionKey(
	room,
	playerId
) {
	return `red-tetris-game:${room}:${playerId}`;
}

export function loadGameSession(
	room,
	playerId
) {
	if (
		!room ||
		!playerId
	) {
		return null;
	}

	try {
		const raw =
			sessionStorage.getItem(
				getGameSessionKey(
					room,
					playerId
				)
			);

		if (!raw)
			return null;

		return JSON.parse(
			raw
		);
	} catch {
		return null;
	}
}

export function saveGameSession(
	room,
	playerId,
	state
) {
	if (
		!room ||
		!playerId
	) {
		return;
	}

	try {
		sessionStorage.setItem(
			getGameSessionKey(
				room,
				playerId
			),
			JSON.stringify(
				state
			)
		);
	} catch {
		/*
		 * Storage errors must not
		 * interrupt gameplay.
		 */
	}
}

export function clearGameSession(
	room,
	playerId
) {
	if (
		!room ||
		!playerId
	) {
		return;
	}

	sessionStorage.removeItem(
		getGameSessionKey(
			room,
			playerId
		)
	);
}