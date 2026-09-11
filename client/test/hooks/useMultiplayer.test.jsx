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

import {
	createBoard
} from "../../src/game/board.js";

const mocks = vi.hoisted(() => ({
	handlers: {},

	socket: {
		on: vi.fn(
			(event, callback) => {
				mocks.handlers[event] =
					callback;
			}
		),

		off: vi.fn(),

		emit: vi.fn()
	}
}));

vi.mock(
	"../../src/socket/socket.js",
	() => ({
		default: mocks.socket
	})
);

import useMultiplayer
	from "../../src/hooks/useMultiplayer.js";

describe(
	"useMultiplayer",
	() => {
		beforeEach(() => {
			vi.clearAllMocks();

			for (
				const key
				of Object.keys(
					mocks.handlers
				)
			) {
				delete mocks.handlers[key];
			}
		});

		it(
			"does not send spectrum while stopped",
			() => {
				const board =
					createBoard();

				const props = {
					room: "alpha",
					started: false,
					board,
					roomState: null,
					playerId: "p1"
				};

				renderHook(
					() =>
						useMultiplayer(
							props
						)
				);

				expect(
					mocks.socket.emit
				).not.toHaveBeenCalledWith(
					"spectrum:update",
					expect.anything()
				);
			}
		);

		it(
			"sends local spectrum while running",
			() => {
				const board =
					createBoard();

				const props = {
					room: "alpha",
					started: true,
					board,
					roomState: null,
					playerId: "p1"
				};

				renderHook(
					() =>
						useMultiplayer(
							props
						)
				);

				expect(
					mocks.socket.emit
				).toHaveBeenCalledWith(
					"spectrum:update",
					{
						room: "alpha",

						spectrum:
							Array(
								10
							).fill(
								0
							)
					}
				);
			}
		);

		it(
			"receives opponent spectrum",
			() => {
				const board =
					createBoard();

				const roomState = {
					players: [
						{
							playerId:
								"p1"
						},

						{
							playerId:
								"p2"
						}
					]
				};

				const props = {
					room: "alpha",
					started: true,
					board,
					roomState,
					playerId: "p1"
				};

				const {
					result
				} = renderHook(
					() =>
						useMultiplayer(
							props
						)
				);

				act(
					() => {
						mocks.handlers[
							"spectrum:update"
						]({
							playerId:
								"p2",

							playerName:
								"Rocket",

							spectrum: [
								1,
								2,
								3
							]
						});
					}
				);

				expect(
					result.current
						.opponents
				).toEqual(
					[
						{
							id:
								"p2",

							name:
								"Rocket",

							spectrum: [
								1,
								2,
								3
							]
						}
					]
				);
			}
		);

		it(
			"ignores own spectrum",
			() => {
				const board =
					createBoard();

				const props = {
					room: "alpha",
					started: true,
					board,
					roomState: null,
					playerId: "p1"
				};

				const {
					result
				} = renderHook(
					() =>
						useMultiplayer(
							props
						)
				);

				act(
					() => {
						mocks.handlers[
							"spectrum:update"
						]({
							playerId:
								"p1",

							playerName:
								"Eric",

							spectrum: [
								4
							]
						});
					}
				);

				expect(
					result.current
						.opponents
				).toEqual([]);
			}
		);

		it(
			"clears spectra when returning to lobby",
			() => {
				const board =
					createBoard();

				const initialProps = {
					room: "alpha",
					started: true,
					board,
					roomState: null,
					playerId: "p1"
				};

				const {
					result,
					rerender
				} = renderHook(
					(props) =>
						useMultiplayer(
							props
						),
					{
						initialProps
					}
				);

				act(
					() => {
						mocks.handlers[
							"spectrum:update"
						]({
							playerId:
								"p2",

							playerName:
								"Bot",

							spectrum: [
								2
							]
						});
					}
				);

				expect(
					result.current
						.opponents
						.length
				).toBe(
					1
				);

				rerender({
					...initialProps,
					started:
						false
				});

				expect(
					result.current
						.opponents
				).toEqual(
					[]
				);
			}
		);

		it(
			"removes disconnected opponents",
			() => {
				const board =
					createBoard();

				const firstRoomState = {
					players: [
						{
							playerId:
								"p1"
						},

						{
							playerId:
								"p2"
						}
					]
				};

				const secondRoomState = {
					players: [
						{
							playerId:
								"p1"
						}
					]
				};

				const initialProps = {
					room:
						"alpha",

					started:
						true,

					board,

					roomState:
						firstRoomState,

					playerId:
						"p1"
				};

				const {
					result,
					rerender
				} = renderHook(
					(props) =>
						useMultiplayer(
							props
						),
					{
						initialProps
					}
				);

				act(
					() => {
						mocks.handlers[
							"spectrum:update"
						]({
							playerId:
								"p2",

							playerName:
								"Bot",

							spectrum: [
								2
							]
						});
					}
				);

				expect(
					result.current
						.opponents
						.length
				).toBe(
					1
				);

				rerender({
					...initialProps,

					roomState:
						secondRoomState
				});

				expect(
					result.current
						.opponents
				).toEqual(
					[]
				);
			}
		);

		it(
			"unsubscribes on unmount",
			() => {
				const board =
					createBoard();

				const props = {
					room: "alpha",
					started: false,
					board,
					roomState: null,
					playerId: "p1"
				};

				const {
					unmount
				} = renderHook(
					() =>
						useMultiplayer(
							props
						)
				);

				unmount();

				expect(
					mocks.socket.off
				).toHaveBeenCalledWith(
					"spectrum:update",
					expect.any(
						Function
					)
				);
			}
		);
	}
);
