import { describe, expect, it } from "vitest";
import {
	fireEvent,
	render,
	screen
} from "@testing-library/react";

import GamePanel from "../../src/components/GamePanel/GamePanel.jsx";

describe("GamePanel", () => {
	it("renders padded score", () => {
		render(
			<GamePanel
				score={42}
				nextPiece={null}
			/>
		);

		expect(screen.getByText("000042")).toBeTruthy();
		expect(screen.getByText("NEXT")).toBeTruthy();
	});

	it("renders next piece", () => {
		const { container } = render(
			<GamePanel
				score={1}
				nextPiece={{
					type: "I",
					shape: [[1, 1, 1, 1]]
				}}
			/>
		);

		expect(
			container.querySelectorAll(".cell-I").length
		).toBe(4);
	});

	it("opens and closes controls", () => {
		const { container } = render(
			<GamePanel score={0} nextPiece={null} />
		);

		const button =
			screen.getByRole("button", {
				name: /CONTROLS/
			});

		expect(button.getAttribute("aria-expanded")).toBe("false");

		fireEvent.click(button);

		expect(button.getAttribute("aria-expanded")).toBe("true");
		expect(
			container.querySelector(".controls-container-open")
		).toBeTruthy();

		fireEvent.click(button);

		expect(button.getAttribute("aria-expanded")).toBe("false");
	});
});
