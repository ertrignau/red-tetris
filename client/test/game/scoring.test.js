import {
	describe,
	it,
	expect
} from "vitest";

import {
	calculateScore
} from "../../src/game/scoring.js";

describe("calculateScore", () => {
	it("returns 0 for zero cleared lines", () => {
		expect(
			calculateScore(0)
		).toBe(0);
	});

	it("returns 100 for one cleared line", () => {
		expect(
			calculateScore(1)
		).toBe(100);
	});

	it("returns 300 for two cleared lines", () => {
		expect(
			calculateScore(2)
		).toBe(300);
	});

	it("returns 500 for three cleared lines", () => {
		expect(
			calculateScore(3)
		).toBe(500);
	});

	it("returns 800 for four cleared lines", () => {
		expect(
			calculateScore(4)
		).toBe(800);
	});

	it("returns zero for unsupported values", () => {
		expect(
			calculateScore(5)
		).toBe(0);

		expect(
			calculateScore(-1)
		).toBe(0);
	});
});