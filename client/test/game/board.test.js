import {
	describe,
	it,
	expect
} from "vitest";

import {
	BOARD_WIDTH,
	BOARD_HEIGHT,
	createBoard,
	lockPiece
} from "../../src/game/board.js";

describe("board", () => {
	it("creates a 20x10 empty board", () => {
		const board =
			createBoard();

		expect(board).toHaveLength(
			BOARD_HEIGHT
		);

		for (const row of board) {
			expect(row).toHaveLength(
				BOARD_WIDTH
			);

			expect(
				row.every(
					(cell) =>
						cell === null
				)
			).toBe(true);
		}
	});

	it("creates independent rows", () => {
		const board =
			createBoard();

		board[0][0] = "X";

		expect(
			board[1][0]
		).toBe(null);
	});

	it("locks a piece on the board", () => {
		const board =
			createBoard();

		const piece = {
			type: "O",
			shape: [
				[1, 1],
				[1, 1]
			],
			x: 3,
			y: 5
		};

		const result =
			lockPiece(
				board,
				piece
			);

		expect(result[5][3]).toBe("O");
		expect(result[5][4]).toBe("O");
		expect(result[6][3]).toBe("O");
		expect(result[6][4]).toBe("O");
	});

	it("does not mutate the original board", () => {
		const board =
			createBoard();

		const piece = {
			type: "I",
			shape: [[1]],
			x: 0,
			y: 0
		};

		const result =
			lockPiece(
				board,
				piece
			);

		expect(
			board[0][0]
		).toBe(null);

		expect(
			result[0][0]
		).toBe("I");
	});

	it("ignores cells outside the board", () => {
		const board =
			createBoard();

		const piece = {
			type: "T",
			shape: [
				[1, 1],
				[1, 1]
			],
			x: -1,
			y: -1
		};

		const result =
			lockPiece(
				board,
				piece
			);

		expect(
			result[0][0]
		).toBe("T");

		expect(
			result.flat()
				.filter(
					(cell) =>
						cell === "T"
				)
		).toHaveLength(1);
	});

	it("ignores empty cells from piece shape", () => {
		const board =
			createBoard();

		const piece = {
			type: "T",
			shape: [
				[0, 1, 0],
				[1, 1, 1]
			],
			x: 3,
			y: 0
		};

		const result =
			lockPiece(
				board,
				piece
			);

		expect(
			result[0][3]
		).toBe(null);

		expect(
			result[0][4]
		).toBe("T");
	});
});