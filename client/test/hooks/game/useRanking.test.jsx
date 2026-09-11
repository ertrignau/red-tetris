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

const mocks = vi.hoisted(() => ({
	handlers: {},
	socket: {
		on: vi.fn((event, callback) => {
			mocks.handlers[event] = callback;
		}),
		off: vi.fn()
	}
}));

vi.mock("../../../src/socket/socket.js", () => ({
	default: mocks.socket
}));

import useRanking from "../../../src/hooks/game/useRanking.js";

describe("useRanking", () => {
	beforeEach(() => {
		vi.useFakeTimers();
		vi.clearAllMocks();

		for (const key of Object.keys(mocks.handlers))
			delete mocks.handlers[key];
	});

	afterEach(() => {
		vi.runOnlyPendingTimers();
		vi.useRealTimers();
	});

	it("starts empty", () => {
		const { result } = renderHook(() =>
			useRanking({})
		);

		expect(result.current.showRanking).toBe(false);
		expect(result.current.isFading).toBe(false);
		expect(result.current.isFinishing).toBe(false);
		expect(result.current.ranking).toEqual([]);
		expect(result.current.finishedMode).toBeNull();
	});

	it("handles multiplayer game finish transition", () => {
		const onGameFinished = vi.fn();

		const { result } = renderHook(() =>
			useRanking({
				onGameFinished
			})
		);

		const ranking = [
			{
				playerId: "p1",
				name: "Eric"
			}
		];

		act(() => {
			mocks.handlers["game:finished"]({
				mode: "battle-royale",
				ranking
			});
		});

		expect(result.current.ranking).toEqual(ranking);
		expect(result.current.finishedMode).toBe("battle-royale");
		expect(result.current.isFinishing).toBe(true);
		expect(onGameFinished).toHaveBeenCalled();

		act(() => {
			vi.advanceTimersByTime(600);
		});

		expect(result.current.isFading).toBe(true);

		act(() => {
			vi.advanceTimersByTime(400);
		});

		expect(result.current.showRanking).toBe(true);
		expect(result.current.isFading).toBe(false);
		expect(result.current.isFinishing).toBe(false);
	});

	it("does not show ranking in solo", () => {
		const { result } = renderHook(() =>
			useRanking({})
		);

		act(() => {
			mocks.handlers["game:finished"]({
				mode: "solo",
				ranking: []
			});
		});

		expect(result.current.finishedMode).toBe("solo");
		expect(result.current.showRanking).toBe(false);
		expect(result.current.isFinishing).toBe(false);
		expect(result.current.isFading).toBe(false);
	});

	it("supports missing ranking and mode", () => {
		const { result } = renderHook(() =>
			useRanking({})
		);

		act(() => {
			mocks.handlers["game:finished"]({});
		});

		expect(result.current.ranking).toEqual([]);
		expect(result.current.finishedMode).toBeNull();
	});

	it("resetRanking restores initial state", () => {
		const { result } = renderHook(() =>
			useRanking({})
		);

		act(() => {
			mocks.handlers["game:finished"]({
				mode: "solo",
				ranking: [{ playerId: "p1" }]
			});
		});

		act(() => {
			result.current.resetRanking();
		});

		expect(result.current.ranking).toEqual([]);
		expect(result.current.finishedMode).toBeNull();
		expect(result.current.showRanking).toBe(false);
	});

	it("cleans socket listener", () => {
		const { unmount } = renderHook(() =>
			useRanking({})
		);

		unmount();

		expect(mocks.socket.off).toHaveBeenCalledWith(
			"game:finished",
			expect.any(Function)
		);
	});
});
