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
		connected: false,
		on: vi.fn((event, callback) => {
			mocks.handlers[event] = callback;
		}),
		off: vi.fn(),
		emit: vi.fn()
	},
	getPlayerId: vi.fn(() => "p1")
}));

vi.mock("../../src/socket/socket.js", () => ({
	default: mocks.socket
}));

vi.mock("../../src/utils/playerIdentity.js", () => ({
	getPlayerId: mocks.getPlayerId
}));

import useSocket from "../../src/hooks/useSocket.js";

describe("useSocket", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mocks.socket.connected = false;
		for (const key of Object.keys(mocks.handlers))
			delete mocks.handlers[key];
	});

	it("initializes socket state", () => {
		const { result } = renderHook(
			() => useSocket("alpha", "Eric")
		);

		expect(result.current.playerId).toBe("p1");
		expect(result.current.roomState).toBeNull();
		expect(result.current.error).toBeNull();
		expect(result.current.currentPiece).toBeNull();
		expect(result.current.nextPiece).toBeNull();
	});

	it("joins immediately when already connected", () => {
		mocks.socket.connected = true;

		renderHook(
			() => useSocket("alpha", "Eric")
		);

		expect(
			mocks.socket.emit
		).toHaveBeenCalledWith(
			"room:join",
			{
				room: "alpha",
				player: "Eric",
				playerId: "p1"
			}
		);
	});

	it("joins on socket connect", () => {
		renderHook(
			() => useSocket("alpha", "Eric")
		);

		act(() => {
			mocks.handlers.connect();
		});

		expect(
			mocks.socket.emit
		).toHaveBeenCalledWith(
			"room:join",
			expect.objectContaining({
				room: "alpha"
			})
		);
	});

	it("updates room state", () => {
		const { result } = renderHook(
			() => useSocket("alpha", "Eric")
		);

		act(() => {
			mocks.handlers["room:error"]({
				message: "bad"
			});
		});

		expect(result.current.error).toBe("bad");

		act(() => {
			mocks.handlers["room:state"]({
				started: true
			});
		});

		expect(result.current.roomState).toEqual({
			started: true
		});

		expect(result.current.error).toBeNull();
	});

	it("receives current and next pieces", () => {
		const { result } = renderHook(
			() => useSocket("alpha", "Eric")
		);

		act(() => {
			mocks.handlers["piece:next"]({
				piece: "O",
				nextPiece: "I"
			});
		});

		expect(result.current.currentPiece.type).toBe("O");
		expect(result.current.nextPiece.type).toBe("I");
	});

	it("clears next piece when absent", () => {
		const { result } = renderHook(
			() => useSocket("alpha", "Eric")
		);

		act(() => {
			mocks.handlers["piece:next"]({
				piece: "T",
				nextPiece: null
			});
		});

		expect(result.current.currentPiece.type).toBe("T");
		expect(result.current.nextPiece).toBeNull();
	});

	it("removes listeners on unmount", () => {
		const { unmount } = renderHook(
			() => useSocket("alpha", "Eric")
		);

		unmount();

		expect(mocks.socket.off).toHaveBeenCalledWith(
			"connect",
			expect.any(Function)
		);

		expect(mocks.socket.off).toHaveBeenCalledWith(
			"room:state",
			expect.any(Function)
		);

		expect(mocks.socket.off).toHaveBeenCalledWith(
			"room:error",
			expect.any(Function)
		);

		expect(mocks.socket.off).toHaveBeenCalledWith(
			"piece:next",
			expect.any(Function)
		);
	});
});
