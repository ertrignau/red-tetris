import {
	beforeEach,
	describe,
	expect,
	it,
	vi
} from "vitest";

import {
	act,
	fireEvent,
	render,
	screen
} from "@testing-library/react";

const mocks = vi.hoisted(() => ({
	navigate: vi.fn(),
	handlers: {},
	socket: {
		on: vi.fn((event, callback) => {
			mocks.handlers[event] = callback;
		}),
		off: vi.fn(),
		emit: vi.fn()
	},
	getPlayerId: vi.fn(() => "player-id")
}));

vi.mock("react-router-dom", () => ({
	useNavigate: () => mocks.navigate
}));

vi.mock("../../src/socket/socket.js", () => ({
	default: mocks.socket
}));

vi.mock("../../src/utils/playerIdentity.js", () => ({
	getPlayerId: mocks.getPlayerId
}));

import Home from "../../src/pages/Home/Home.jsx";

describe("Home", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		for (const key of Object.keys(mocks.handlers))
			delete mocks.handlers[key];
	});

	function fillPlayer(name = "Eric") {
		fireEvent.change(
			screen.getByPlaceholderText("username"),
			{
				target: {
					value: name
				}
			}
		);
	}

	function fillRoom(room = "alpha") {
		fireEvent.change(
			screen.getByPlaceholderText("room Id"),
			{
				target: {
					value: room
				}
			}
		);
	}

	it("renders home page", () => {
		render(<Home />);

		expect(screen.getByText("Join game")).toBeTruthy();
		expect(screen.getByText("JOIN GAME")).toBeTruthy();
		expect(screen.getByText("FIND MATCH")).toBeTruthy();
	});

	it("joins a valid room", () => {
		render(<Home />);

		fillPlayer("  Eric  ");
		fillRoom("  alpha  ");

		fireEvent.click(
			screen.getByRole("button", {
				name: "JOIN GAME"
			})
		);

		expect(
			mocks.navigate
		).toHaveBeenCalledWith("/alpha/Eric");
	});

	it("validates player length", () => {
		render(<Home />);

		fillPlayer("ab");

		fireEvent.click(
			screen.getByRole("button", {
				name: "FIND MATCH"
			})
		);

		expect(
			screen.getByText(
				"Player name must be between 3 and 16 characters"
			)
		).toBeTruthy();
	});

	it("validates room length", () => {
		render(<Home />);

		fillPlayer();
		fillRoom("ab");

		fireEvent.click(
			screen.getByRole("button", {
				name: "JOIN GAME"
			})
		);

		expect(
			screen.getByText(
				"Room name must be between 3 and 20 characters"
			)
		).toBeTruthy();
	});

	it("validates room characters", () => {
		render(<Home />);

		fillPlayer();
		fillRoom("bad room!");

		fireEvent.click(
			screen.getByRole("button", {
				name: "JOIN GAME"
			})
		);

		expect(
			screen.getByText(
				"Room can only contain letters, numbers, - and _"
			)
		).toBeTruthy();
	});

	it("starts matchmaking", () => {
		render(<Home />);

		fillPlayer("Eric");

		fireEvent.click(
			screen.getByRole("button", {
				name: "FIND MATCH"
			})
		);

		expect(
			mocks.socket.emit
		).toHaveBeenCalledWith(
			"matchmaking:join",
			{
				player: "Eric",
				playerId: "player-id"
			}
		);

		expect(
			screen.getByText("SEARCHING FOR GAME")
		).toBeTruthy();
	});

	it("handles matchmaking success", () => {
		render(<Home />);

		fillPlayer("Eric");

		act(() => {
			mocks.handlers["matchmaking:found"]({
				room: "match-42"
			});
		});

		expect(
			mocks.navigate
		).toHaveBeenCalledWith("/match-42/Eric");
	});

	it("handles matchmaking error", () => {
		render(<Home />);

		act(() => {
			mocks.handlers["matchmaking:error"]({
				message: "No room"
			});
		});

		expect(screen.getByText("No room")).toBeTruthy();
	});

	it("uses fallback matchmaking error", () => {
		render(<Home />);

		act(() => {
			mocks.handlers["matchmaking:error"]({});
		});

		expect(
			screen.getByText("Matchmaking error")
		).toBeTruthy();
	});

	it("removes socket listeners on unmount", () => {
		const { unmount } = render(<Home />);

		unmount();

		expect(mocks.socket.off).toHaveBeenCalledWith(
			"matchmaking:found",
			expect.any(Function)
		);

		expect(mocks.socket.off).toHaveBeenCalledWith(
			"matchmaking:error",
			expect.any(Function)
		);
	});
});
