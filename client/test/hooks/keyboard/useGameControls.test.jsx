import {
	beforeEach,
	describe,
	it,
	expect,
	vi
} from "vitest";

import {
	renderHook
} from "@testing-library/react";

const {
	mockMovement,
	mockRotation,
	mockDrop
} = vi.hoisted(
	() => ({
		mockMovement:
			vi.fn(),

		mockRotation:
			vi.fn(),

		mockDrop:
			vi.fn()
	})
);

vi.mock(
	"../../../src/hooks/keyboard/useMovementKeys.js",
	() => ({
		default:
			mockMovement
	})
);

vi.mock(
	"../../../src/hooks/keyboard/useRotationKey.js",
	() => ({
		default:
			mockRotation
	})
);

vi.mock(
	"../../../src/hooks/keyboard/useDropKey.js",
	() => ({
		default:
			mockDrop
	})
);

import useGameControls
	from "../../../src/hooks/keyboard/useGameControls.js";

describe("useGameControls", () => {
	const board = [
		[null]
	];

	const piece = {
		type: "X",
		shape: [[1]],
		x: 0,
		y: 0
	};

	const setCurrentPiece =
		vi.fn();

	const onHardDrop =
		vi.fn();

	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("enables controls when game is running", () => {
		renderHook(
			() =>
				useGameControls({
					started: true,
					gameOver:
						false,
					currentPiece:
						piece,
					board,
					setCurrentPiece,
					onHardDrop
				})
		);

		expect(
			mockMovement
		).toHaveBeenCalledWith({
			enabled: true,
			board,
			setCurrentPiece
		});

		expect(
			mockRotation
		).toHaveBeenCalledWith({
			enabled: true,
			board,
			setCurrentPiece
		});

		expect(
			mockDrop
		).toHaveBeenCalledWith({
			enabled: true,
			onHardDrop
		});
	});

	it("disables controls when game has not started", () => {
		renderHook(
			() =>
				useGameControls({
					started: false,
					gameOver:
						false,
					currentPiece:
						piece,
					board,
					setCurrentPiece,
					onHardDrop
				})
		);

		expect(
			mockMovement.mock
				.calls[0][0]
				.enabled
		).toBe(false);
	});

	it("disables controls when game is over", () => {
		renderHook(
			() =>
				useGameControls({
					started: true,
					gameOver:
						true,
					currentPiece:
						piece,
					board,
					setCurrentPiece,
					onHardDrop
				})
		);

		expect(
			mockRotation.mock
				.calls[0][0]
				.enabled
		).toBe(false);
	});

	it("disables controls when there is no piece", () => {
		renderHook(
			() =>
				useGameControls({
					started: true,
					gameOver:
						false,
					currentPiece:
						null,
					board,
					setCurrentPiece,
					onHardDrop
				})
		);

		expect(
			mockDrop.mock
				.calls[0][0]
				.enabled
		).toBe(false);
	});
});