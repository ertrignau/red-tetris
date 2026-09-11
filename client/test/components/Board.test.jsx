import { describe, expect, it } from "vitest";
import { render } from "@testing-library/react";
import Board from "../../src/components/Board/Board.jsx";
import { createBoard } from "../../src/game/board.js";

describe("Board component", () => {
	it("renders the complete 10x20 board", () => {
		const { container } = render(
			<Board
				board={createBoard()}
				piece={null}
			/>
		);

		expect(
			container.querySelectorAll(".cell").length
		).toBe(200);
	});

	it("draws locked cells", () => {
		const board = createBoard();
		board[19][0] = "I";

		const { container } = render(
			<Board board={board} piece={null} />
		);

		expect(
			container.querySelectorAll(".cell-I").length
		).toBe(1);
	});

	it("draws current and ghost pieces", () => {
		const piece = {
			type: "O",
			shape: [
				[1, 1],
				[1, 1]
			],
			x: 4,
			y: 0
		};

		const { container } = render(
			<Board
				board={createBoard()}
				piece={piece}
			/>
		);

		expect(
			container.querySelectorAll(".cell-O").length
		).toBe(4);

		expect(
			container.querySelectorAll(".cell-ghost-O").length
		).toBe(4);
	});

	it("does not mutate the source board", () => {
		const board = createBoard();

		render(
			<Board
				board={board}
				piece={{
					type: "O",
					shape: [[1]],
					x: 0,
					y: 0
				}}
			/>
		);

		expect(board[0][0]).toBeNull();
	});
});
