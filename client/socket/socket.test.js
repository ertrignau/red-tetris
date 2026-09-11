import {
	describe,
	expect,
	it,
	vi
} from "vitest";

const mocks = vi.hoisted(() => ({
	socket: {
		connected: false
	},
	io: vi.fn()
}));

mocks.io.mockReturnValue(mocks.socket);

vi.mock("socket.io-client", () => ({
	io: mocks.io
}));

import socket from "../../src/socket/socket.js";

describe("socket", () => {
	it("creates a Socket.IO client", () => {
		expect(mocks.io).toHaveBeenCalledOnce();
		expect(socket).toBe(mocks.socket);
	});
});
