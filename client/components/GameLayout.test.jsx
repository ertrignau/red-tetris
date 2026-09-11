import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import GameLayout from "../../src/components/GameLayout/GameLayout.jsx";
import { createBoard } from "../../src/game/board.js";

describe("GameLayout", () => {
	it("renders player, game and side panels", () => {
		render(
			<GameLayout
				roomState={{
					started: false,
					mode: "battle-royale",
					players: [{
						playerId: "p1",
						name: "Eric",
						isHost: true,
						isBot: false
					}]
				}}
				player="Eric"
				playerId="p1"
				error={null}
				isHost={true}
				onStart={vi.fn()}
				onModeChange={vi.fn()}
				onAddBot={vi.fn()}
				onRemoveBot={vi.fn()}
				showBoard={false}
				isFinishing={false}
				board={createBoard()}
				currentPiece={null}
				gameOver={false}
				score={25}
				countdown={null}
				nextPiece={null}
				opponents={[]}
			/>
		);

		expect(screen.getByText("Players")).toBeTruthy();
		expect(screen.getByText("WAITING FOR HOST")).toBeTruthy();
		expect(screen.getByText("000025")).toBeTruthy();
	});
});
