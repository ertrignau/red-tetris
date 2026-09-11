import { describe, expect, it } from "vitest";
import { render } from "@testing-library/react";
import PiecePreview from "../../src/components/PiecePreview/PiecePreview.jsx";

describe("PiecePreview", () => {
	it("renders an empty preview without piece", () => {
		const { container } = render(
			<PiecePreview piece={null} />
		);

		expect(container.textContent).toContain("-");
		expect(
			container.querySelector(".empty-preview")
		).toBeTruthy();
	});

	it("renders a piece shape", () => {
		const { container } = render(
			<PiecePreview
				piece={{
					type: "O",
					shape: [
						[1, 1],
						[1, 1]
					]
				}}
			/>
		);

		expect(
			container.querySelectorAll(".preview-cell").length
		).toBe(4);

		expect(
			container.querySelectorAll(".cell-O").length
		).toBe(4);
	});

	it("renders empty shape cells without piece class", () => {
		const { container } = render(
			<PiecePreview
				piece={{
					type: "T",
					shape: [
						[0, 1, 0],
						[1, 1, 1]
					]
				}}
			/>
		);

		expect(
			container.querySelectorAll(".preview-cell").length
		).toBe(6);

		expect(
			container.querySelectorAll(".cell-T").length
		).toBe(4);
	});
});
