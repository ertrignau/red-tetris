import {
	beforeEach,
	afterEach,
	describe,
	it,
	expect,
	vi
} from "vitest";

import {
	getPlayerId
} from "../../src/utils/playerIdentity.js";

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
			)
	};
}

describe("getPlayerId", () => {
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

	it("returns an existing player id", () => {
		storage.setItem(
			"red-tetris-player-id",
			"existing-id"
		);

		expect(
			getPlayerId()
		).toBe(
			"existing-id"
		);
	});

	it("does not generate a new id when one already exists", () => {
		storage.setItem(
			"red-tetris-player-id",
			"existing-id"
		);

		const randomUUID =
			vi.fn(
				() =>
					"new-id"
			);

		vi.stubGlobal(
			"crypto",
			{
				randomUUID
			}
		);

		getPlayerId();

		expect(
			randomUUID
		).not.toHaveBeenCalled();
	});

	it("generates an id using crypto.randomUUID", () => {
		vi.stubGlobal(
			"crypto",
			{
				randomUUID:
					vi.fn(
						() =>
							"generated-uuid"
					)
			}
		);

		expect(
			getPlayerId()
		).toBe(
			"generated-uuid"
		);
	});

	it("stores a generated UUID in sessionStorage", () => {
		vi.stubGlobal(
			"crypto",
			{
				randomUUID:
					vi.fn(
						() =>
							"generated-uuid"
					)
			}
		);

		getPlayerId();

		expect(
			storage.setItem
		).toHaveBeenCalledWith(
			"red-tetris-player-id",
			"generated-uuid"
		);
	});

	it("uses fallback generation when randomUUID is unavailable", () => {
		vi.stubGlobal(
			"crypto",
			{}
		);

		vi.spyOn(
			Date,
			"now"
		).mockReturnValue(
			123456789
		);

		vi.spyOn(
			Math,
			"random"
		)
			.mockReturnValueOnce(
				0.123456
			)
			.mockReturnValueOnce(
				0.654321
			);

		const playerId =
			getPlayerId();

		expect(
			typeof playerId
		).toBe("string");

		expect(
			playerId.split("-")
		).toHaveLength(3);
	});

	it("stores the fallback id", () => {
		vi.stubGlobal(
			"crypto",
			{}
		);

		const playerId =
			getPlayerId();

		expect(
			storage.setItem
		).toHaveBeenCalledWith(
			"red-tetris-player-id",
			playerId
		);
	});

	it("returns the same id on subsequent calls", () => {
		vi.stubGlobal(
			"crypto",
			{
				randomUUID:
					vi.fn(
						() =>
							"stable-id"
					)
			}
		);

		const first =
			getPlayerId();

		const second =
			getPlayerId();

		expect(first).toBe(
			"stable-id"
		);

		expect(second).toBe(
			"stable-id"
		);
	});
});