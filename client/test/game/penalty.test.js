import {
	describe,
	it,
	expect
} from "vitest";

import {
	createBoard
} from "../../src/game/board.js";

import {
	addPenaltyLines
} from "../../src/game/penalty.js";

describe("addPenaltyLines", () => {
	it("returns the original board when count is zero", () => {
		const board =
			createBoard();

		expect(
			addPenaltyLines(
				board,
				0
			)
		).toBe(board);
	});

	it("returns the original board when count is negative", () => {
		const board =
			createBoard();

		expect(
			addPenaltyLines(
				board,
				-1
			)
		).toBe(board);
	});

	it("returns null when board is null", () => {
		expect(
			addPenaltyLines(
				null,
				2
			)
		).toBe(null);
	});

	it("adds one penalty line at the bottom", () => {
		const board =
			createBoard();

		const result =
			addPenaltyLines(
				board,
				1
			);

		expect(result).toHaveLength(20);

		expect(
			result[19]
		).toEqual(
			Array(10).fill("P")
		);
	});

	it("adds several penalty lines", () => {
		const board =
			createBoard();

		const result =
			addPenaltyLines(
				board,
				3
			);

		expect(
			result[17]
		).toEqual(
			Array(10).fill("P")
		);

		expect(
			result[18]
		).toEqual(
			Array(10).fill("P")
		);

		expect(
			result[19]
		).toEqual(
			Array(10).fill("P")
		);
	});

	it("keeps board height unchanged", () => {
		const result =
			addPenaltyLines(
				createBoard(),
				5
			);

		expect(result).toHaveLength(20);
	});

	it("pushes top rows out of the board", () => {
		const board =
			createBoard();

		board[1][0] = "I";

		const result =
			addPenaltyLines(
				board,
				1
			);

		expect(
			result[0][0]
		).toBe("I");
	});

	it("caps penalty lines to board height", () => {
		const board =
			createBoard();

		const result =
			addPenaltyLines(
				board,
				100
			);

		expect(result).toHaveLength(20);

		expect(
			result.every(
				(row) =>
					row.every(
						(cell) =>
							cell === "P"
					)
			)
		).toBe(true);
	});

	it("copies retained rows instead of mutating them", () => {
		const board =
			createBoard();

		board[1][0] = "I";

		const result =
			addPenaltyLines(
				board,
				1
			);

		result[0][0] = "Z";

		expect(
			board[1][0]
		).toBe("I");
	});
});