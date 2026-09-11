import { describe, expect, it } from "vitest";
import { render } from "@testing-library/react";
import Spectrum from "../../src/components/Spectrum/Spectrum.jsx";

describe("Spectrum", () => {
	it("renders one column per spectrum entry", () => {
		const { container } = render(
			<Spectrum spectrum={[0, 1, 2, 5]} />
		);

		expect(
			container.querySelectorAll(".spectrum-column").length
		).toBe(4);
	});

	it("converts heights to pixels", () => {
		const { container } = render(
			<Spectrum spectrum={[0, 3]} />
		);

		const fills =
			container.querySelectorAll(".spectrum-fill");

		expect(fills[0].style.height).toBe("0px");
		expect(fills[1].style.height).toBe("15px");
	});

	it("supports an empty spectrum", () => {
		const { container } = render(
			<Spectrum spectrum={[]} />
		);

		expect(
			container.querySelectorAll(".spectrum-column").length
		).toBe(0);
	});
});
