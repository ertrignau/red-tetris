function getKey(
	room,
	playerId
) {
	return `${room}:${playerId}`;
}

export function createDisconnectTimers() {
	const timers =
		new Map();

	const cancel =
		(
			room,
			playerId
		) => {
			const key =
				getKey(
					room,
					playerId
				);

			const timeout =
				timers.get(
					key
				);

			if (!timeout)
				return;

			clearTimeout(
				timeout
			);

			timers.delete(
				key
			);
		};

	const schedule =
		(
			room,
			playerId,
			delay,
			callback
		) => {
			cancel(
				room,
				playerId
			);

			const key =
				getKey(
					room,
					playerId
				);

			const timeout =
				setTimeout(
					() => {
						timers.delete(
							key
						);

						callback();
					},
					delay
				);

			timers.set(
				key,
				timeout
			);
		};

	return {
		cancel,
		schedule
	};
}