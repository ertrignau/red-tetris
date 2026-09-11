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

import useMovementKeys
	from "../../../src/hooks/keyboard/useMovementKeys.js";

describe("useMovementKeys", () => {
	const piece = {
		type: "X",
		shape: [[1]],
		x: 4,
		y: 5
	};

	function createSetter(
		currentPiece = piece
	) {
		return vi.fn(
			(updater) =>
				updater(
					currentPiece
				)
		);
	}

	it("moves left on ArrowLeft", () => {
		const setCurrentPiece =
			createSetter();

		renderHook(
			() =>
				useMovementKeys({
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
		).toHaveBeenCalled();

		const updater =
			setCurrentPiece.mock
				.calls[0][0];

		expect(
			updater(piece).x
		).toBe(3);
	});

	it("moves right on ArrowRight", () => {
		const setCurrentPiece =
			createSetter();

		renderHook(
			() =>
				useMovementKeys({
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
						"ArrowRight"
				}
			)
		);

		const updater =
			setCurrentPiece.mock
				.calls[0][0];

		expect(
			updater(piece).x
		).toBe(5);
	});

	it("moves down on ArrowDown", () => {
		const setCurrentPiece =
			createSetter();

		renderHook(
			() =>
				useMovementKeys({
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
						"ArrowDown"
				}
			)
		);

		const updater =
			setCurrentPiece.mock
				.calls[0][0];

		expect(
			updater(piece).y
		).toBe(6);
	});

	it("ignores unrelated keys", () => {
		const setCurrentPiece =
			vi.fn();

		renderHook(
			() =>
				useMovementKeys({
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
					code: "KeyA"
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
				useMovementKeys({
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
						"ArrowLeft"
				}
			)
		);

		expect(
			setCurrentPiece
		).not.toHaveBeenCalled();
	});

	it("returns null when there is no current piece", () => {
		const setCurrentPiece =
			vi.fn();

		renderHook(
			() =>
				useMovementKeys({
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
				useMovementKeys({
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
						"ArrowLeft"
				}
			)
		);

		expect(
			setCurrentPiece
		).not.toHaveBeenCalled();
	});
});