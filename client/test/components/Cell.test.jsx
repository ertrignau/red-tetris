import { describe, expect, it } from "vitest";
import { render } from "@testing-library/react";
import Cell from "../../src/components/Cell/Cell.jsx";

describe("Cell", () => {
	it("renders an empty cell", () => {
		const { container } = render(<Cell value={null} />);
		expect(container.firstChild.className).toBe("cell ");
	});

	it("renders the piece class", () => {
		const { container } = render(<Cell value="T" />);
		expect(container.firstChild.className).toContain("cell-T");
	});

	it("renders ghost cells", () => {
		const { container } = render(<Cell value="ghost-I" />);
		expect(container.firstChild.className).toContain("cell-ghost-I");
	});
});
