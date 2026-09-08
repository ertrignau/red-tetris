const USERNAME_MIN_LENGTH = 3;
const USERNAME_MAX_LENGTH = 16;

const ROOM_MIN_LENGTH = 3;
const ROOM_MAX_LENGTH = 20;

const ROOM_REGEX =
	/^[a-zA-Z0-9_-]+$/;

export function validateUsername(
	username
) {
	if (
		typeof username !==
		"string"
	) {
		return "Invalid username";
	}

	if (
		username.length <
			USERNAME_MIN_LENGTH ||
		username.length >
			USERNAME_MAX_LENGTH
	) {
		return `Username must be between ${USERNAME_MIN_LENGTH} and ${USERNAME_MAX_LENGTH} characters`;
	}

	return null;
}

export function validateRoom(
	room
) {
	if (
		typeof room !==
		"string"
	) {
		return "Invalid room";
	}

	if (
		room.length <
			ROOM_MIN_LENGTH ||
		room.length >
			ROOM_MAX_LENGTH
	) {
		return `Room name must be between ${ROOM_MIN_LENGTH} and ${ROOM_MAX_LENGTH} characters`;
	}

	if (
		!ROOM_REGEX.test(
			room
		)
	) {
		return "Room can only contain letters, numbers, - and _";
	}

	return null;
}

export function validatePlayerId(
	playerId
) {
	if (
		typeof playerId !==
			"string" ||
		playerId.length === 0 ||
		playerId.length > 128
	) {
		return "Invalid player id";
	}

	return null;
}