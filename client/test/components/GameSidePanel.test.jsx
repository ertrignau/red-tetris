import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import GameSidePanel from "../../src/components/GameSidePanel/GameSidePanel.jsx";

describe("GameSidePanel", () => {
	it("renders game information without opponents", () => {
		const { container } = render(
			<GameSidePanel
				score={12}
				nextPiece={null}
				opponents={[]}
			/>
		);

		expect(screen.getByText("000012")).toBeTruthy();
		expect(
			container.querySelector(".opponents-list")
		).toBeNull();
	});

	it("renders opponents", () => {
		render(
			<GameSidePanel
				score={0}
				nextPiece={null}
				opponents={[
					{
						id: "p2",
						name: "Player Two",
						spectrum: [1, 2]
					},
					{
						id: "p3",
						name: "Player Three",
						spectrum: [3, 4]
					}
				]}
			/>
		);

		expect(screen.getByText("Player Two")).toBeTruthy();
		expect(screen.getByText("Player Three")).toBeTruthy();
	});
});
