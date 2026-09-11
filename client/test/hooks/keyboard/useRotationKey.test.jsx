import {
	describe,
	it,
	expect,
	vi
} from "vitest";

import {
	renderHook
} from "@testing-library/react";

import {
	createBoard
} from "../../../src/game/board.js";

import useRotationKey
	from "../../../src/hooks/keyboard/useRotationKey.js";

describe("useRotationKey", () => {
	const piece = {
		type: "X",

		shape: [
			[1, 0],
			[1, 1]
		],

		x: 4,
		y: 4,
		rotation: 0
	};

	it("rotates on ArrowUp", () => {
		const setCurrentPiece =
			vi.fn();

		renderHook(
			() =>
				useRotationKey({
					enabled: true,
					board:
						createBoard(),
					setCurrentPiece
				})
		);

		window.dispatchEvent(
			new KeyboardEvent(
				"keydown",
				{
					code:
						"ArrowUp"
				}
			)
		);

		expect(
			setCurrentPiece
		).toHaveBeenCalledTimes(1);

		const updater =
			setCurrentPiece.mock
				.calls[0][0];

		const result =
			updater(piece);

		expect(
			result.rotation
		).toBe(1);
	});

	it("ignores unrelated keys", () => {
		const setCurrentPiece =
			vi.fn();

		renderHook(
			() =>
				useRotationKey({
					enabled: true,
					board:
						createBoard(),
					setCurrentPiece
				})
		);

		window.dispatchEvent(
			new KeyboardEvent(
				"keydown",
				{
					code:
						"ArrowLeft"
				}
			)
		);

		expect(
			setCurrentPiece
		).not.toHaveBeenCalled();
	});

	it("ignores repeated ArrowUp events", () => {
		const setCurrentPiece =
			vi.fn();

		renderHook(
			() =>
				useRotationKey({
					enabled: true,
					board:
						createBoard(),
					setCurrentPiece
				})
		);

		window.dispatchEvent(
			new KeyboardEvent(
				"keydown",
				{
					code:
						"ArrowUp",

					repeat:
						true
				}
			)
		);

		expect(
			setCurrentPiece
		).not.toHaveBeenCalled();
	});

	it("does nothing when disabled", () => {
		const setCurrentPiece =
			vi.fn();

		renderHook(
			() =>
				useRotationKey({
					enabled: false,
					board:
						createBoard(),
					setCurrentPiece
				})
		);

		window.dispatchEvent(
			new KeyboardEvent(
				"keydown",
				{
					code:
						"ArrowUp"
				}
			)
		);

		expect(
			setCurrentPiece
		).not.toHaveBeenCalled();
	});

	it("returns null if current piece is null", () => {
		const setCurrentPiece =
			vi.fn();

		renderHook(
			() =>
				useRotationKey({
					enabled: true,
					board:
						createBoard(),
					setCurrentPiece
				})
		);

		window.dispatchEvent(
			new KeyboardEvent(
				"keydown",
				{
					code:
						"ArrowUp"
				}
			)
		);

		const updater =
			setCurrentPiece.mock
				.calls[0][0];

		expect(
			updater(null)
		).toBe(null);
	});

	it("removes listener when unmounted", () => {
		const setCurrentPiece =
			vi.fn();

		const {
			unmount
		} = renderHook(
			() =>
				useRotationKey({
					enabled: true,
					board:
						createBoard(),
					setCurrentPiece
				})
		);

		unmount();

		window.dispatchEvent(
			new KeyboardEvent(
				"keydown",
				{
					code:
						"ArrowUp"
				}
			)
		);

		expect(
			setCurrentPiece
		).not.toHaveBeenCalled();
	});
});