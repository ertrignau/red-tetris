import {
	describe,
	it,
	expect
} from "vitest";

import {
	renderHook,
	act
} from "@testing-library/react";

import useGameState
	from "../../../src/hooks/game/useGameState.js";

describe("useGameState", () => {
	it("initializes an empty board", () => {
		const {
			result
		} = renderHook(
			() => useGameState()
		);

		expect(
			result.current.board
		).toHaveLength(20);

		expect(
			result.current.board[0]
		).toHaveLength(10);

		expect(
			result.current.board.flat().every(
				(cell) => cell === null
			)
		).toBe(true);
	});

	it("initializes score to zero", () => {
		const {
			result
		} = renderHook(
			() => useGameState()
		);

		expect(
			result.current.score
		).toBe(0);
	});

	it("initializes gameOver to false", () => {
		const {
			result
		} = renderHook(
			() => useGameState()
		);

		expect(
			result.current.gameOver
		).toBe(false);
	});

	it("updates the score", () => {
		const {
			result
		} = renderHook(
			() => useGameState()
		);

		act(() => {
			result.current.setScore(
				500
			);
		});

		expect(
			result.current.score
		).toBe(500);
	});

	it("updates gameOver", () => {
		const {
			result
		} = renderHook(
			() => useGameState()
		);

		act(() => {
			result.current.setGameOver(
				true
			);
		});

		expect(
			result.current.gameOver
		).toBe(true);
	});

	it("updates the board", () => {
		const {
			result
		} = renderHook(
			() => useGameState()
		);

		act(() => {
			result.current.setBoard(
				(board) => {
					const next =
						board.map(
							(row) =>
								[...row]
						);

					next[19][0] =
						"I";

					return next;
				}
			);
		});

		expect(
			result.current.board[19][0]
		).toBe("I");
	});

	it("resets the complete game state", () => {
		const {
			result
		} = renderHook(
			() => useGameState()
		);

		act(() => {
			result.current.setScore(
				1000
			);

			result.current.setGameOver(
				true
			);

			result.current.setBoard(
				(board) => {
					const next =
						board.map(
							(row) =>
								[...row]
						);

					next[19][0] =
						"T";

					return next;
				}
			);
		});

		act(() => {
			result.current.resetGameState();
		});

		expect(
			result.current.score
		).toBe(0);

		expect(
			result.current.gameOver
		).toBe(false);

		expect(
			result.current.board.flat().every(
				(cell) =>
					cell === null
			)
		).toBe(true);
	});
});