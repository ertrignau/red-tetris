import {
	beforeEach,
	describe,
	expect,
	it,
	vi
} from "vitest";

import {
	act,
	render,
	screen
} from "@testing-library/react";

const mocks = vi.hoisted(() => ({
	handlers: {},
	socket: {
		connected: false,
		id: "socket-1",
		on: vi.fn((event, callback) => {
			mocks.handlers[event] = callback;
		}),
		off: vi.fn(),
		emit: vi.fn()
	}
}));

vi.mock("../../src/socket/socket.js", () => ({
	default: mocks.socket
}));

import App from "../../src/app/App.jsx";

describe("App", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mocks.socket.connected = false;

		for (const key of Object.keys(mocks.handlers))
			delete mocks.handlers[key];
	});

	it("shows disconnected state", () => {
		render(<App />);

		expect(
			screen.getByText("Socket: disconnected")
		).toBeTruthy();
	});

	it("handles socket connection and ping", () => {
		render(<App />);

		act(() => {
			mocks.handlers.connect();
		});

		expect(
			screen.getByText("Socket: connected")
		).toBeTruthy();

		expect(mocks.socket.emit).toHaveBeenCalledWith(
			"ping:test",
			{
				message: "hello server"
			}
		);
	});

	it("handles disconnect", () => {
		mocks.socket.connected = true;

		render(<App />);

		act(() => {
			mocks.handlers.disconnect();
		});

		expect(
			screen.getByText("Socket: disconnected")
		).toBeTruthy();
	});

	it("handles pong and unregisters listeners", () => {
		const { unmount } = render(<App />);

		act(() => {
			mocks.handlers["pong:test"]({
				ok: true
			});
		});

		unmount();

		expect(mocks.socket.off).toHaveBeenCalledWith(
			"connect",
			expect.any(Function)
		);

		expect(mocks.socket.off).toHaveBeenCalledWith(
			"disconnect",
			expect.any(Function)
		);

		expect(mocks.socket.off).toHaveBeenCalledWith(
			"pong:test",
			expect.any(Function)
		);
	});
});
