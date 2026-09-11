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
	socket: {
		emit: vi.fn()
	}
}));

vi.mock("../../../src/socket/socket.js", () => ({
	default: mocks.socket
}));

import useGameActions from "../../../src/hooks/game/useGameActions.js";

function setup(overrides = {}) {
	const resetClient = vi.fn();

	const props = {
		room: "alpha",
		roomState: {
			started: false,
			players: [
				{ playerId: "p1" },
				{ playerId: "p2" }
			]
		},
		isHost: true,
		resetClient,
		...overrides
	};

	const hook = renderHook(
		() => useGameActions(props)
	);

	return {
		...hook,
		props,
		resetClient
	};
}

describe("useGameActions", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("changes mode as host", () => {
		const { result } = setup();

		act(() => {
			result.current.handleModeChange("points");
		});

		expect(mocks.socket.emit).toHaveBeenCalledWith(
			"game:mode",
			{
				room: "alpha",
				mode: "points"
			}
		);
	});

	it("does not change mode with only one player", () => {
		const { result } = setup({
			roomState: {
				started: false,
				players: [{ playerId: "p1" }]
			}
		});

		act(() => {
			result.current.handleModeChange("points");
		});

		expect(mocks.socket.emit).not.toHaveBeenCalled();
	});

	it("starts game", () => {
		const {
			result,
			resetClient
		} = setup();

		act(() => {
			result.current.handleStart();
		});

		expect(resetClient).toHaveBeenCalledOnce();

		expect(mocks.socket.emit).toHaveBeenCalledWith(
			"game:start",
			{
				room: "alpha"
			}
		);
	});

	it("adds and removes bots", () => {
		const { result } = setup();

		act(() => {
			result.current.handleAddBot();
			result.current.handleRemoveBot("bot-1");
		});

		expect(mocks.socket.emit).toHaveBeenCalledWith(
			"bot:add",
			{
				room: "alpha"
			}
		);

		expect(mocks.socket.emit).toHaveBeenCalledWith(
			"bot:remove",
			{
				room: "alpha",
				botId: "bot-1"
			}
		);
	});

	it("blocks actions for non host", () => {
		const {
			result,
			resetClient
		} = setup({
			isHost: false
		});

		act(() => {
			result.current.handleModeChange("points");
			result.current.handleStart();
			result.current.handleAddBot();
			result.current.handleRemoveBot("bot");
		});

		expect(resetClient).not.toHaveBeenCalled();
		expect(mocks.socket.emit).not.toHaveBeenCalled();
	});

	it("blocks actions after game starts", () => {
		const { result } = setup({
			roomState: {
				started: true,
				players: [
					{ playerId: "p1" },
					{ playerId: "p2" }
				]
			}
		});

		act(() => {
			result.current.handleModeChange("points");
			result.current.handleStart();
			result.current.handleAddBot();
			result.current.handleRemoveBot("bot");
		});

		expect(mocks.socket.emit).not.toHaveBeenCalled();
	});
});
