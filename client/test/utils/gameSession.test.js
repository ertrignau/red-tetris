import {
	beforeEach,
	afterEach,
	describe,
	it,
	expect,
	vi
} from "vitest";

import {
	loadGameSession,
	saveGameSession,
	clearGameSession
} from "../../src/utils/gameSession.js";

function createSessionStorageMock() {
	const values =
		new Map();

	return {
		getItem:
			vi.fn(
				(key) =>
					values.has(key)
						? values.get(key)
						: null
			),

		setItem:
			vi.fn(
				(key, value) => {
					values.set(
						key,
						value
					);
				}
			),

		removeItem:
			vi.fn(
				(key) => {
					values.delete(
						key
					);
				}
			)
	};
}

describe("gameSession", () => {
	let storage;

	beforeEach(() => {
		storage =
			createSessionStorageMock();

		vi.stubGlobal(
			"sessionStorage",
			storage
		);
	});

	afterEach(() => {
		vi.unstubAllGlobals();
		vi.restoreAllMocks();
	});

	it("saves a game session", () => {
		const state = {
			score: 123
		};

		saveGameSession(
			"room1",
			"player1",
			state
		);

		expect(
			storage.setItem
		).toHaveBeenCalledWith(
			"red-tetris-game:room1:player1",
			JSON.stringify(state)
		);
	});

	it("loads a saved game session", () => {
		const state = {
			score: 123,
			gameOver: false
		};

		saveGameSession(
			"room1",
			"player1",
			state
		);

		expect(
			loadGameSession(
				"room1",
				"player1"
			)
		).toEqual(state);
	});

	it("returns null when room is missing", () => {
		expect(
			loadGameSession(
				"",
				"player1"
			)
		).toBe(null);
	});

	it("returns null when player id is missing", () => {
		expect(
			loadGameSession(
				"room1",
				""
			)
		).toBe(null);
	});

	it("returns null when no session exists", () => {
		expect(
			loadGameSession(
				"room1",
				"player1"
			)
		).toBe(null);
	});

	it("returns null when stored JSON is invalid", () => {
		storage.getItem
			.mockReturnValueOnce(
				"{bad json"
			);

		expect(
			loadGameSession(
				"room1",
				"player1"
			)
		).toBe(null);
	});

	it("returns null when storage throws while loading", () => {
		storage.getItem =
			vi.fn(
				() => {
					throw new Error(
						"storage error"
					);
				}
			);

		expect(
			loadGameSession(
				"room1",
				"player1"
			)
		).toBe(null);
	});

	it("does not save without room", () => {
		saveGameSession(
			"",
			"player1",
			{}
		);

		expect(
			storage.setItem
		).not.toHaveBeenCalled();
	});

	it("does not save without player id", () => {
		saveGameSession(
			"room1",
			"",
			{}
		);

		expect(
			storage.setItem
		).not.toHaveBeenCalled();
	});

	it("does not throw when storage fails while saving", () => {
		storage.setItem =
			vi.fn(
				() => {
					throw new Error(
						"storage error"
					);
				}
			);

		expect(() =>
			saveGameSession(
				"room1",
				"player1",
				{}
			)
		).not.toThrow();
	});

	it("clears a saved session", () => {
		clearGameSession(
			"room1",
			"player1"
		);

		expect(
			storage.removeItem
		).toHaveBeenCalledWith(
			"red-tetris-game:room1:player1"
		);
	});

	it("does not clear without room", () => {
		clearGameSession(
			"",
			"player1"
		);

		expect(
			storage.removeItem
		).not.toHaveBeenCalled();
	});

	it("does not clear without player id", () => {
		clearGameSession(
			"room1",
			""
		);

		expect(
			storage.removeItem
		).not.toHaveBeenCalled();
	});
});