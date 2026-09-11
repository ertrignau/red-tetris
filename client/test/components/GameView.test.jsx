import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import GameView from "../../src/components/GameView/GameView.jsx";
import { createBoard } from "../../src/game/board.js";

function makeGame(overrides = {}) {
	return {
		playerId: "p1",
		roomState: {
			started: false,
			mode: "battle-royale",
			hostId: "p1",
			players: [{
				playerId: "p1",
				name: "Eric",
				isHost: true,
				isBot: false
			}]
		},
		error: null,
		isHost: true,
		board: createBoard(),
		score: 0,
		gameOver: false,
		currentPiece: null,
		nextPiece: null,
		countdown: null,
		showBoard: false,
		opponents: [],
		showRanking: false,
		isFading: false,
		isFinishing: false,
		ranking: [],
		finishedMode: null,
		handleStart: vi.fn(),
		handleModeChange: vi.fn(),
		handleRestart: vi.fn(),
		handleAddBot: vi.fn(),
		handleRemoveBot: vi.fn(),
		...overrides
	};
}

describe("GameView", () => {
	it("renders normal game layout", () => {
		render(
			<GameView
				room="alpha"
				player="Eric"
				game={makeGame()}
			/>
		);

		expect(screen.getByText(/ALPHA/)).toBeTruthy();
		expect(screen.getByText("Players")).toBeTruthy();
	});

	it("renders final ranking", () => {
		render(
			<GameView
				room="alpha"
				player="Eric"
				game={makeGame({
					showRanking: true,
					finishedMode: "battle-royale",
					ranking: [{
						playerId: "p1",
						name: "Eric",
						isHost: true
					}]
				})}
			/>
		);

		expect(screen.getByText("RANKING")).toBeTruthy();
		expect(screen.getByText("PLAY AGAIN")).toBeTruthy();
	});

	it("keeps layout for solo finish", () => {
		render(
			<GameView
				room="solo"
				player="Eric"
				game={makeGame({
					showRanking: true,
					finishedMode: "solo"
				})}
			/>
		);

		expect(screen.queryByText("RANKING")).toBeNull();
		expect(screen.getByText("Players")).toBeTruthy();
	});

	it("renders ranking fade overlay", () => {
		const { container } = render(
			<GameView
				room="alpha"
				player="Eric"
				game={makeGame({
					isFading: true
				})}
			/>
		);

		expect(
			container.querySelector(".ranking-fade-overlay")
		).toBeTruthy();
	});
});
