import {
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
	},
	clearGameSession: vi.fn(),
	loadGameSession: vi.fn(),
	saveGameSession: vi.fn()
}));

vi.mock("../../../src/socket/socket.js", () => ({
	default: mocks.socket
}));

vi.mock("../../../src/utils/gameSession.js", () => ({
	clearGameSession: mocks.clearGameSession,
	loadGameSession: mocks.loadGameSession,
	saveGameSession: mocks.saveGameSession
}));

import useGameSession from "../../../src/hooks/game/useGameSession.js";

function makeProps(overrides = {}) {
	return {
		room: "alpha",
		playerId: "p1",
		roomState: {
			started: false,
			roundId: null
		},
		board: createBoard(),
		setBoard: vi.fn(),
		score: 0,
		setScore: vi.fn(),
		gameOver: false,
		setGameOver: vi.fn(),
		currentPiece: null,
		setCurrentPiece: vi.fn(),
		nextPiece: null,
		setNextPiece: vi.fn(),
		...overrides
	};
}

describe("useGameSession", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mocks.loadGameSession.mockReturnValue(null);
	});

	it("is not ready outside an active round", () => {
		const { result } = renderHook(() =>
			useGameSession(makeProps())
		);

		expect(result.current.sessionReady).toBe(false);
	});

	it("initializes a new round", () => {
		const props = makeProps({
			roomState: {
				started: true,
				roundId: 42
			}
		});

		const { result } = renderHook(() =>
			useGameSession(props)
		);

		expect(result.current.sessionReady).toBe(true);
		expect(props.setBoard).toHaveBeenCalled();
		expect(props.setScore).toHaveBeenCalledWith(0);
		expect(props.setGameOver).toHaveBeenCalledWith(false);
		expect(props.setCurrentPiece).toHaveBeenCalledWith(null);
		expect(props.setNextPiece).toHaveBeenCalledWith(null);

		expect(
			mocks.clearGameSession
		).toHaveBeenCalledWith("alpha", "p1");

		expect(mocks.socket.emit).toHaveBeenCalledWith(
			"piece:next",
			{
				room: "alpha"
			}
		);
	});

	it("restores matching saved round", () => {
		const savedBoard = createBoard();

		mocks.loadGameSession.mockReturnValue({
			roundId: 5,
			board: savedBoard,
			score: 99,
			gameOver: true,
			currentPiece: {
				type: "T"
			},
			nextPiece: {
				type: "I"
			}
		});

		const props = makeProps({
			roomState: {
				started: true,
				roundId: 5
			}
		});

		const { result } = renderHook(() =>
			useGameSession(props)
		);

		expect(result.current.sessionReady).toBe(true);
		expect(props.setBoard).toHaveBeenCalledWith(savedBoard);
		expect(props.setScore).toHaveBeenCalledWith(99);
		expect(props.setGameOver).toHaveBeenCalledWith(true);
		expect(props.setCurrentPiece).toHaveBeenCalledWith({
			type: "T"
		});
		expect(props.setNextPiece).toHaveBeenCalledWith({
			type: "I"
		});

		expect(mocks.socket.emit).not.toHaveBeenCalledWith(
			"piece:next",
			expect.anything()
		);
	});

	it("does not restore a snapshot from another round", () => {
		mocks.loadGameSession.mockReturnValue({
			roundId: 1
		});

		const props = makeProps({
			roomState: {
				started: true,
				roundId: 2
			}
		});

		renderHook(() =>
			useGameSession(props)
		);

		expect(mocks.socket.emit).toHaveBeenCalledWith(
			"piece:next",
			{
				room: "alpha"
			}
		);
	});

	it("saves active session", () => {
		const piece = {
			type: "O",
			shape: [[1]],
			x: 0,
			y: 0
		};

		const props = makeProps({
			roomState: {
				started: true,
				roundId: 10
			},
			currentPiece: piece,
			score: 123
		});

		renderHook(() =>
			useGameSession(props)
		);

		expect(
			mocks.saveGameSession
		).toHaveBeenCalledWith(
			"alpha",
			"p1",
			expect.objectContaining({
				roundId: 10,
				score: 123,
				currentPiece: piece
			})
		);
	});

	it("resetSession clears stored session", () => {
		const { result } = renderHook(() =>
			useGameSession(makeProps())
		);

		act(() => {
			result.current.resetSession();
		});

		expect(
			mocks.clearGameSession
		).toHaveBeenCalledWith("alpha", "p1");

		expect(result.current.sessionReady).toBe(false);
	});
});
