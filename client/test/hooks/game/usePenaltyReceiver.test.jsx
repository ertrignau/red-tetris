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
		off: vi.fn()
	}
}));

vi.mock("../../../src/socket/socket.js", () => ({
	default: mocks.socket
}));

import usePenaltyReceiver from "../../../src/hooks/game/usePenaltyReceiver.js";

describe("usePenaltyReceiver", () => {
	beforeEach(() => {
		vi.clearAllMocks();

		for (const key of Object.keys(mocks.handlers))
			delete mocks.handlers[key];
	});

	it("applies received penalty", () => {
		const applyPenalty = vi.fn();

		renderHook(() =>
			usePenaltyReceiver(applyPenalty)
		);

		act(() => {
			mocks.handlers["penalty:add"]({
				count: 3,
				from: "Rocket"
			});
		});

		expect(applyPenalty).toHaveBeenCalledWith(3);
	});

	it("removes listener on unmount", () => {
		const { unmount } = renderHook(() =>
			usePenaltyReceiver(vi.fn())
		);

		unmount();

		expect(mocks.socket.off).toHaveBeenCalledWith(
			"penalty:add",
			expect.any(Function)
		);
	});
});
