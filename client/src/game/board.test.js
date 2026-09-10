import {
	describe,
	it,
	expect
} from "vitest";

import {
	createBoard
} from "./board.js";

describe("createBoard", () => {
	it("creates a 20x10 empty board", () => {
		const board = createBoard();

		expect(board).toHaveLength(20);

		for (const row of board) {
			expect(row).toHaveLength(10);
			expect(
				row.every(
					cell => cell === null
				)
			).toBe(true);
		}
	});
});