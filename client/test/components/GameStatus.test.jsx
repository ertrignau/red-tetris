import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import GameStatus from "../../src/components/GameStatus/GameStatus.jsx";
import { createBoard } from "../../src/game/board.js";

function renderStatus(overrides = {}) {
	return render(
		<GameStatus
			started={false}
			finishing={false}
			board={createBoard()}
			currentPiece={null}
			gameOver={false}
			score={0}
			countdown={null}
			{...overrides}
		/>
	);
}

describe("GameStatus", () => {
	it("shows lobby waiting state", () => {
		renderStatus();

		expect(
			screen.getByText("WAITING FOR HOST")
		).toBeTruthy();

		expect(screen.getByText("READY?")).toBeTruthy();
	});

	it("shows a running game", () => {
		const { container } = renderStatus({
			started: true
		});

		expect(
			screen.getByText("GAME IN PROGRESS")
		).toBeTruthy();

		expect(
			container.querySelectorAll(".cell").length
		).toBe(200);
	});

	it("shows countdown", () => {
		renderStatus({
			started: true,
			countdown: 3
		});

		expect(
			screen.getAllByText("GET READY").length
		).toBeGreaterThan(0);

		expect(screen.getByText("3")).toBeTruthy();
	});

	it("shows finishing state", () => {
		renderStatus({
			started: true,
			finishing: true
		});

		expect(
			screen.getByText("MATCH COMPLETE")
		).toBeTruthy();
	});

	it("shows game over and score", () => {
		renderStatus({
			started: true,
			gameOver: true,
			score: 1337
		});

		expect(
			screen.getAllByText("GAME OVER").length
		).toBeGreaterThan(0);

		expect(
			screen.getByText(/SCORE 1337/)
		).toBeTruthy();
	});
});
