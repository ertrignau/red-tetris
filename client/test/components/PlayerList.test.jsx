import { describe, expect, it, vi } from "vitest";
import {
	fireEvent,
	render,
	screen
} from "@testing-library/react";

import PlayerList from "../../src/components/PlayerList/PlayerList.jsx";

const players = [
	{
		playerId: "p1",
		name: "Eric",
		isHost: true,
		isBot: false
	},
	{
		playerId: "bot1",
		name: "Bot",
		isHost: false,
		isBot: true
	}
];

function renderList(overrides = {}) {
	const props = {
		roomState: {
			started: false,
			mode: "battle-royale",
			players
		},
		player: "Eric",
		playerId: "p1",
		error: null,
		isHost: true,
		onStart: vi.fn(),
		mode: "battle-royale",
		onModeChange: vi.fn(),
		onAddBot: vi.fn(),
		onRemoveBot: vi.fn(),
		...overrides
	};

	const view = render(<PlayerList {...props} />);

	return {
		...view,
		props
	};
}

describe("PlayerList", () => {
	it("renders loading state", () => {
		renderList({
			roomState: null,
			isHost: false
		});

		expect(
			screen.getByText("Loading players...")
		).toBeTruthy();
	});

	it("renders current player and room players", () => {
		renderList();

		expect(screen.getAllByText("Eric").length).toBeGreaterThan(0);
		expect(screen.getByText("Bot")).toBeTruthy();
		expect(screen.getByText("BOT")).toBeTruthy();
		expect(screen.getByText("HOST")).toBeTruthy();
	});

	it("renders an error", () => {
		renderList({
			error: "Room error"
		});

		expect(screen.getByText("Room error")).toBeTruthy();
	});

	it("allows host to start the game", () => {
		const { props } = renderList();

		fireEvent.click(
			screen.getByRole("button", {
				name: "START GAME"
			})
		);

		expect(props.onStart).toHaveBeenCalledOnce();
	});

	it("allows host to add a bot", () => {
		const { props } = renderList();

		fireEvent.click(
			screen.getByRole("button", {
				name: "+ ADD BOT"
			})
		);

		expect(props.onAddBot).toHaveBeenCalledOnce();
	});

	it("allows host to remove a bot", () => {
		const { props } = renderList();

		fireEvent.click(
			screen.getByTitle("Remove bot")
		);

		expect(
			props.onRemoveBot
		).toHaveBeenCalledWith("bot1");
	});

	it("allows host to change game mode", () => {
		const { props } = renderList();

		fireEvent.click(
			screen.getByRole("button", {
				name: "POINTS"
			})
		);

		expect(
			props.onModeChange
		).toHaveBeenCalledWith("points");

		fireEvent.click(
			screen.getByRole("button", {
				name: "BATTLE ROYALE"
			})
		);

		expect(
			props.onModeChange
		).toHaveBeenCalledWith("battle-royale");
	});

	it("shows mode as text when user is not host", () => {
		renderList({
			isHost: false,
			mode: "points"
		});

		expect(screen.getByText("POINTS")).toBeTruthy();
		expect(
			screen.queryByText("START GAME")
		).toBeNull();
	});

	it("hides lobby actions once game has started", () => {
		renderList({
			roomState: {
				started: true,
				mode: "battle-royale",
				players
			}
		});

		expect(
			screen.queryByText("START GAME")
		).toBeNull();

		expect(
			screen.queryByText("+ ADD BOT")
		).toBeNull();
	});
});
