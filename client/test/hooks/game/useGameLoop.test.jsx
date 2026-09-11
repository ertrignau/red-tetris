import {
	afterEach,
	beforeEach,
	describe,
	expect,
	it,
	vi
} from "vitest";

import {
	act,
	renderHook
} from "@testing-library/react";

import { createBoard } from "../../../src/game/board.js";

const mocks = vi.hoisted(() => ({
	socket: {
		emit: vi.fn()
	}
}));

vi.mock("../../../src/socket/socket.js", () => ({
	default: mocks.socket
}));

import useGameLoop from "../../../src/hooks/game/useGameLoop.js";

function piece(overrides = {}) {
	return {
		type: "O",
		shape: [
			[1, 1],
			[1, 1]
		],
		x: 4,
		y: 0,
		...overrides
	};
}

function setup(overrides = {}) {
	const props = {
		room: "alpha",
		started: true,
		board: createBoard(),
		setBoard: vi.fn(),
		currentPiece: piece(),
		setCurrentPiece: vi.fn(),
		gameOver: false,
		setGameOver: vi.fn(),
		setScore: vi.fn(),
		...overrides
	};

	const hook = renderHook(
		({ data }) => useGameLoop(data),
		{
			initialProps: {
				data: props
			}
		}
	);

	return {
		...hook,
		props
	};
}

describe("useGameLoop", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	afterEach(() => {
		vi.useRealTimers();
	});

	it("hard drops and requests next piece", () => {
		const {
			result,
			props
		} = setup();

		act(() => {
			result.current.hardDropCurrentPiece();
		});

		expect(
			props.setCurrentPiece
		).toHaveBeenCalledWith(null);

		expect(props.setBoard).toHaveBeenCalled();

		expect(mocks.socket.emit).toHaveBeenCalledWith(
			"piece:next",
			{
				room: "alpha"
			}
		);
	});

	it("ignores hard drop while stopped", () => {
		const {
			result,
			props
		} = setup({
			started: false
		});

		act(() => {
			result.current.hardDropCurrentPiece();
		});

		expect(props.setBoard).not.toHaveBeenCalled();
	});

	it("ignores hard drop after game over", () => {
		const {
			result,
			props
		} = setup({
			gameOver: true
		});

		act(() => {
			result.current.hardDropCurrentPiece();
		});

		expect(props.setBoard).not.toHaveBeenCalled();
	});

	it("clears lines, updates score and sends penalty", () => {
		const board = createBoard();

		for (let y = 18; y <= 19; y++) {
			for (let x = 0; x < 10; x++) {
				board[y][x] =
					x === 4 || x === 5
						? null
						: "I";
			}
		}

		const {
			result,
			props
		} = setup({
			board,
			currentPiece: piece()
		});

		act(() => {
			result.current.hardDropCurrentPiece();
		});

		expect(props.setScore).toHaveBeenCalled();

		const scoreUpdater =
			props.setScore.mock.calls[0][0];

		let score;

		act(() => {
			score = scoreUpdater(10);
		});

		expect(score).toBeGreaterThan(10);

		expect(mocks.socket.emit).toHaveBeenCalledWith(
			"score:update",
			expect.objectContaining({
				room: "alpha",
				score
			})
		);

		expect(mocks.socket.emit).toHaveBeenCalledWith(
			"penalty:send",
			{
				room: "alpha",
				count: 1
			}
		);
	});

	it("applies penalty and moves current piece upward", () => {
		const {
			result,
			props
		} = setup({
			currentPiece: piece({
				y: 8
			})
		});

		act(() => {
			result.current.applyPenalty(3);
		});

		expect(props.setBoard).toHaveBeenCalled();

		expect(
			props.setCurrentPiece
		).toHaveBeenCalledWith(
			expect.objectContaining({
				y: 5
			})
		);
	});

	it("sanitizes invalid penalties", () => {
		const {
			result,
			props
		} = setup();

		act(() => {
			result.current.applyPenalty(0);
			result.current.applyPenalty(-10);
			result.current.applyPenalty("invalid");
		});

		expect(props.setBoard).not.toHaveBeenCalled();
	});

	it("ignores penalty while stopped", () => {
		const {
			result,
			props
		} = setup({
			started: false
		});

		act(() => {
			result.current.applyPenalty(2);
		});

		expect(props.setBoard).not.toHaveBeenCalled();
	});

	it("detects game over collision", () => {
		const board = createBoard();
		board[0][0] = "I";

		const props = {
			room: "alpha",
			started: true,
			board,
			setBoard: vi.fn(),
			currentPiece: {
				type: "O",
				shape: [[1]],
				x: 0,
				y: 0
			},
			setCurrentPiece: vi.fn(),
			gameOver: false,
			setGameOver: vi.fn(),
			setScore: vi.fn()
		};

		renderHook(() =>
			useGameLoop(props)
		);

		expect(
			props.setCurrentPiece
		).toHaveBeenCalledWith(null);

		expect(
			props.setGameOver
		).toHaveBeenCalledWith(true);

		expect(mocks.socket.emit).toHaveBeenCalledWith(
			"player:dead",
			{
				room: "alpha"
			}
		);
	});

	it("moves piece down with gravity", () => {
		vi.useFakeTimers();

		const {
			props
		} = setup({
			currentPiece: piece({
				y: 0
			})
		});

		act(() => {
			vi.advanceTimersByTime(700);
		});

		expect(
			props.setCurrentPiece
		).toHaveBeenCalledWith(
			expect.objectContaining({
				y: 1
			})
		);
	});

	it("locks piece when gravity reaches collision", () => {
		vi.useFakeTimers();

		const {
			props
		} = setup({
			currentPiece: piece({
				y: 18
			})
		});

		act(() => {
			vi.advanceTimersByTime(700);
		});

		expect(
			props.setCurrentPiece
		).toHaveBeenCalledWith(null);

		expect(props.setBoard).toHaveBeenCalled();
	});
});
