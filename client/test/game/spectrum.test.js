import {
	describe,
	it,
	expect
} from "vitest";

import {
	createBoard
} from "../../src/game/board.js";

import {
	calculateSpectrum
} from "../../src/game/spectrum.js";

describe("calculateSpectrum", () => {
	it("returns an empty array for null board", () => {
		expect(
			calculateSpectrum(null)
		).toEqual([]);
	});

	it("returns an empty array for an empty board", () => {
		expect(
			calculateSpectrum([])
		).toEqual([]);
	});

	it("returns zero for every empty column", () => {
		const result =
			calculateSpectrum(
				createBoard()
			);

		expect(
			result
		).toEqual(
			Array(10).fill(0)
		);
	});

	it("calculates column heights", () => {
		const board =
			createBoard();

		board[19][0] = "I";
		board[15][1] = "T";
		board[10][2] = "O";

		const result =
			calculateSpectrum(
				board
			);

		expect(result[0]).toBe(1);
		expect(result[1]).toBe(5);
		expect(result[2]).toBe(10);
		expect(result[3]).toBe(0);
	});

	it("uses the highest occupied cell in a column", () => {
		const board =
			createBoard();

		board[18][0] = "I";
		board[5][0] = "T";

		const result =
			calculateSpectrum(
				board
			);

		expect(
			result[0]
		).toBe(15);
	});

	it("counts penalty blocks as occupied cells", () => {
		const board =
			createBoard();

		board[19][4] = "P";

		const result =
			calculateSpectrum(
				board
			);

		expect(
			result[4]
		).toBe(1);
	});
});