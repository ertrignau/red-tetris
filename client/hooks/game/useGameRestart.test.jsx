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

const mocks = vi.hoisted(() => ({
	handlers: {},
	socket: {
		on: vi.fn((event, callback) => {
			mocks.handlers[event] = callback;
		}),
		off: vi.fn(),
		emit: vi.fn()
	}
}));

vi.mock("../../../src/socket/socket.js", () => ({
	default: mocks.socket
}));

import useGameRestart from "../../../src/hooks/game/useGameRestart.js";

function setup(isHost = true) {
	const functions = {
		resetGameState: vi.fn(),
		resetRanking: vi.fn(),
		resetCountdown: vi.fn(),
		resetSession: vi.fn(),
		setCurrentPiece: vi.fn(),
		setNextPiece: vi.fn()
	};

	const hook = renderHook(() =>
		useGameRestart({
			room: "alpha",
			isHost,
			...functions
		})
	);

	return {
		...hook,
		functions
	};
}

describe("useGameRestart", () => {
	beforeEach(() => {
		vi.clearAllMocks();

		for (const key of Object.keys(mocks.handlers))
			delete mocks.handlers[key];
	});

	it("resets complete client state", () => {
		const {
			result,
			functions
		} = setup();

		act(() => {
			result.current.resetClient();
		});

		expect(functions.resetGameState).toHaveBeenCalled();
		expect(functions.resetRanking).toHaveBeenCalled();
		expect(functions.resetCountdown).toHaveBeenCalled();
		expect(functions.resetSession).toHaveBeenCalled();
		expect(functions.setCurrentPiece).toHaveBeenCalledWith(null);
		expect(functions.setNextPiece).toHaveBeenCalledWith(null);
	});

	it("host can request restart", () => {
		const { result } = setup(true);

		act(() => {
			result.current.handleRestart();
		});

		expect(mocks.socket.emit).toHaveBeenCalledWith(
			"game:restart",
			{
				room: "alpha"
			}
		);
	});

	it("non-host cannot restart", () => {
		const { result } = setup(false);

		act(() => {
			result.current.handleRestart();
		});

		expect(mocks.socket.emit).not.toHaveBeenCalled();
	});

	it("resets when server broadcasts restart", () => {
		const { functions } = setup();

		act(() => {
			mocks.handlers["game:restart"]();
		});

		expect(functions.resetGameState).toHaveBeenCalled();
		expect(functions.resetRanking).toHaveBeenCalled();
	});

	it("removes restart listener", () => {
		const { unmount } = setup();

		unmount();

		expect(mocks.socket.off).toHaveBeenCalledWith(
			"game:restart",
			expect.any(Function)
		);
	});
});
