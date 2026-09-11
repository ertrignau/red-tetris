import { describe, expect, it, vi } from "vitest";
import {
	fireEvent,
	render,
	screen
} from "@testing-library/react";

import Ranking from "../../src/pages/Ranking/Ranking.jsx";

const players = [
	{
		playerId: "p1",
		name: "Eric",
		score: 900,
		isHost: true
	},
	{
		playerId: "p2",
		name: "Rocket",
		score: 400,
		isHost: false
	}
];

describe("Ranking", () => {
	it("renders battle royale ranking", () => {
		const { container } = render(
			<Ranking
				players={players}
				currentPlayerId="p1"
				isHost={false}
				onRestart={vi.fn()}
				mode="battle-royale"
			/>
		);

		expect(screen.getByText("BATTLE ROYALE")).toBeTruthy();
		expect(screen.getByText("Eric")).toBeTruthy();
		expect(screen.getByText("Rocket")).toBeTruthy();
		expect(screen.getByText("WAITING FOR HOST...")).toBeTruthy();
		expect(
			container.querySelector(".ranking-current")
		).toBeTruthy();
	});

	it("renders scores in points mode", () => {
		render(
			<Ranking
				players={players}
				currentPlayerId="p2"
				isHost={false}
				onRestart={vi.fn()}
				mode="points"
			/>
		);

		expect(screen.getByText("POINTS")).toBeTruthy();
		expect(screen.getByText("900")).toBeTruthy();
		expect(screen.getByText("400")).toBeTruthy();
	});

	it("renders solo label", () => {
		render(
			<Ranking
				players={[]}
				currentPlayerId="p1"
				isHost={false}
				onRestart={vi.fn()}
				mode="solo"
			/>
		);

		expect(screen.getByText("SOLO")).toBeTruthy();
	});

	it("lets host restart", () => {
		const restart = vi.fn();

		render(
			<Ranking
				players={players}
				currentPlayerId="p1"
				isHost={true}
				onRestart={restart}
				mode="battle-royale"
			/>
		);

		fireEvent.click(
			screen.getByRole("button", {
				name: "PLAY AGAIN"
			})
		);

		expect(restart).toHaveBeenCalledOnce();
	});
});
