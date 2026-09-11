import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";

const mocks = vi.hoisted(() => ({
	useParams: vi.fn(),
	useGameController: vi.fn()
}));

vi.mock("react-router-dom", () => ({
	useParams: mocks.useParams
}));

vi.mock(
	"../../src/hooks/game/useGameController.js",
	() => ({
		default: mocks.useGameController
	})
);

vi.mock(
	"../../src/components/GameView/GameView.jsx",
	() => ({
		default: ({ room, player, game }) => (
			<div>
				<span data-testid="room">{room}</span>
				<span data-testid="player">{player}</span>
				<span data-testid="game">{game.marker}</span>
			</div>
		)
	})
);

import Game from "../../src/pages/Game/Game.jsx";

describe("Game page", () => {
	it("reads URL parameters and builds game controller", () => {
		mocks.useParams.mockReturnValue({
			room: "alpha",
			player: "Eric"
		});

		mocks.useGameController.mockReturnValue({
			marker: "controller"
		});

		render(<Game />);

		expect(
			mocks.useGameController
		).toHaveBeenCalledWith("alpha", "Eric");

		expect(screen.getByTestId("room").textContent).toBe("alpha");
		expect(screen.getByTestId("player").textContent).toBe("Eric");
		expect(screen.getByTestId("game").textContent).toBe("controller");
	});
});
