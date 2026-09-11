import {
	describe,
	expect,
	it,
	vi
} from "vitest";

const mocks = vi.hoisted(() => {
	const socket = {
		connected: false
	};

	const io = vi.fn(
		() => socket
	);

	return {
		socket,
		io
	};
});

vi.mock(
	"socket.io-client",
	() => ({
		io: mocks.io
	})
);

describe(
	"socket",
	() => {
		it(
			"creates a Socket.IO client",
			async () => {
				vi.resetModules();

				const module =
					await import(
						"../../src/socket/socket.js"
					);

				expect(
					mocks.io
				).toHaveBeenCalled();

				expect(
					module.default
				).toBe(
					mocks.socket
				);
			}
		);
	}
);
