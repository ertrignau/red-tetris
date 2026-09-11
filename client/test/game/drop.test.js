import {
	describe,
	it,
	expect
} from "vitest";

import {
	createBoard
} from "../../src/game/board.js";

import {
	hardDrop,
	getGhostPiece
} from "../../src/game/drop.js";

describe("drop", () => {
	it("hard drops a single block to the floor", () => {
		const board =
			createBoard();

		const piece = {
			type: "X",
			shape: [[1]],
			x: 4,
			y: 0
		};

		const result =
			hardDrop(
				board,
				piece
			);

		expect(
			result.y
		).toBe(19);

		expect(
			result.x
		).toBe(4);
	});

	it("stops above another block", () => {
		const board =
			createBoard();

		board[10][4] =
			"Z";

		const piece = {
			type: "X",
			shape: [[1]],
			x: 4,
			y: 0
		};

		const result =
			hardDrop(
				board,
				piece
			);

		expect(
			result.y
		).toBe(9);
	});

	it("does not mutate the original piece", () => {
		const board =
			createBoard();

		const piece = {
			type: "X",
			shape: [[1]],
			x: 4,
			y: 0
		};

		hardDrop(
			board,
			piece
		);

		expect(
			piece.y
		).toBe(0);
	});

	it("returns null when ghost piece is null", () => {
		const board =
			createBoard();

		expect(
			getGhostPiece(
				board,
				null
			)
		).toBe(null);
	});

	it("returns the hard drop position as ghost piece", () => {
		const board =
			createBoard();

		const piece = {
			type: "X",
			shape: [[1]],
			x: 2,
			y: 0
		};

		const ghost =
			getGhostPiece(
				board,
				piece
			);

		expect(
			ghost.y
		).toBe(19);

		expect(
			ghost.x
		).toBe(2);
	});

	it("ghost piece stops above an occupied cell", () => {
		const board =
			createBoard();

		board[15][3] =
			"T";

		const piece = {
			type: "X",
			shape: [[1]],
			x: 3,
			y: 0
		};

		const ghost =
			getGhostPiece(
				board,
				piece
			);

		expect(
			ghost.y
		).toBe(14);
	});
});