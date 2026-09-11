import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import Opponent from "../../src/components/Opponent/Opponent.jsx";

describe("Opponent", () => {
	it("renders opponent information", () => {
		const { container } = render(
			<Opponent
				name="Rocket"
				spectrum={[1, 2, 3]}
			/>
		);

		expect(screen.getByText("Rocket")).toBeTruthy();
		expect(
			container.querySelectorAll(".spectrum-column").length
		).toBe(3);
	});
});
