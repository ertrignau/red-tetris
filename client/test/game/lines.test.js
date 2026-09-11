import {
	describe,
	it,
	expect
} from "vitest";

import {
	createBoard
} from "../../src/game/board.js";

import {
	clearLines
} from "../../src/game/lines.js";

describe("clearLines", () => {
	it("clears no line on an empty board", () => {
		const board =
			createBoard();

		const result =
			clearLines(board);

		expect(
			result.clearedLines
		).toBe(0);

		expect(
			result.board
		).toHaveLength(20);
	});

	it("clears one full line", () => {
		const board =
			createBoard();

		board[19] =
			Array(10).fill("I");

		const result =
			clearLines(board);

		expect(
			result.clearedLines
		).toBe(1);

		expect(
			result.board
		).toHaveLength(20);

		expect(
			result.board[0]
		).toEqual(
			Array(10).fill(null)
		);
	});

	it("clears several full lines", () => {
		const board =
			createBoard();

		board[18] =
			Array(10).fill("I");

		board[19] =
			Array(10).fill("O");

		const result =
			clearLines(board);

		expect(
			result.clearedLines
		).toBe(2);

		expect(
			result.board
		).toHaveLength(20);

		expect(
			result.board[0]
		).toEqual(
			Array(10).fill(null)
		);

		expect(
			result.board[1]
		).toEqual(
			Array(10).fill(null)
		);
	});

	it("does not clear an incomplete line", () => {
		const board =
			createBoard();

		board[19][0] = "I";

		const result =
			clearLines(board);

		expect(
			result.clearedLines
		).toBe(0);

		expect(
			result.board[19][0]
		).toBe("I");
	});

	it("does not clear an indestructible penalty line", () => {
		const board =
			createBoard();

		board[19] =
			Array(10).fill("P");

		const result =
			clearLines(board);

		expect(
			result.clearedLines
		).toBe(0);

		expect(
			result.board[19]
		).toEqual(
			Array(10).fill("P")
		);
	});

	it("does not clear a full line containing a penalty block", () => {
		const board =
			createBoard();

		board[19] =
			Array(10).fill("T");

		board[19][5] = "P";

		const result =
			clearLines(board);

		expect(
			result.clearedLines
		).toBe(0);

		expect(
			result.board[19][5]
		).toBe("P");
	});

	it("keeps existing rows in the correct order after a clear", () => {
		const board =
			createBoard();

		board[17][0] = "T";

		board[18][1] = "Z";

		board[19] =
			Array(10).fill("I");

		const result =
			clearLines(board);

		expect(
			result.clearedLines
		).toBe(1);

		expect(
			result.board[18][0]
		).toBe("T");

		expect(
			result.board[19][1]
		).toBe("Z");
	});
});