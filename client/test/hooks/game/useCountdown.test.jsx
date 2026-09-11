import {
	afterEach,
	beforeEach,
	describe,
	it,
	expect,
	vi
} from "vitest";

import {
	renderHook,
	act
} from "@testing-library/react";

import useCountdown
	from "../../../src/hooks/game/useCountdown.js";

describe("useCountdown", () => {
	beforeEach(() => {
		vi.useFakeTimers();

		vi.setSystemTime(
			new Date(
				"2026-01-01T00:00:00Z"
			)
		);
	});

	afterEach(() => {
		vi.useRealTimers();
	});

	it("starts with no countdown and game disabled", () => {
		const {
			result
		} = renderHook(
			() =>
				useCountdown(null)
		);

		expect(
			result.current.countdown
		).toBe(null);

		expect(
			result.current.gamePlayable
		).toBe(false);
	});

	it("remains reset when game is not started", () => {
		const roomState = {
			started: false,
			countdownEndsAt:
				Date.now() + 3000
		};

		const {
			result
		} = renderHook(
			() =>
				useCountdown(
					roomState
				)
		);

		expect(
			result.current.countdown
		).toBe(null);

		expect(
			result.current.gamePlayable
		).toBe(false);
	});

	it("shows the countdown in seconds", () => {
		const roomState = {
			started: true,
			countdownEndsAt:
				Date.now() + 3000
		};

		const {
			result
		} = renderHook(
			() =>
				useCountdown(
					roomState
				)
		);

		expect(
			result.current.countdown
		).toBe(3);

		expect(
			result.current.gamePlayable
		).toBe(false);
	});

	it("updates the countdown with time", () => {
		const roomState = {
			started: true,
			countdownEndsAt:
				Date.now() + 3000
		};

		const {
			result
		} = renderHook(
			() =>
				useCountdown(
					roomState
				)
		);

		act(() => {
			vi.advanceTimersByTime(
				1100
			);
		});

		expect(
			result.current.countdown
		).toBe(2);
	});

	it("displays GO when countdown ends", () => {
		const roomState = {
			started: true,
			countdownEndsAt:
				Date.now() + 100
		};

		const {
			result
		} = renderHook(
			() =>
				useCountdown(
					roomState
				)
		);

		act(() => {
			vi.advanceTimersByTime(
				100
			);
		});

		expect(
			result.current.countdown
		).toBe("GO");

		expect(
			result.current.gamePlayable
		).toBe(true);
	});

	it("removes GO after 500ms", () => {
		const roomState = {
			started: true,
			countdownEndsAt:
				Date.now()
		};

		const {
			result
		} = renderHook(
			() =>
				useCountdown(
					roomState
				)
		);

		expect(
			result.current.countdown
		).toBe("GO");

		act(() => {
			vi.advanceTimersByTime(
				500
			);
		});

		expect(
			result.current.countdown
		).toBe(null);

		expect(
			result.current.gamePlayable
		).toBe(true);
	});

	it("can manually change gamePlayable", () => {
		const {
			result
		} = renderHook(
			() =>
				useCountdown(null)
		);

		act(() => {
			result.current.setGamePlayable(
				true
			);
		});

		expect(
			result.current.gamePlayable
		).toBe(true);
	});

	it("resetCountdown restores initial state", () => {
		const {
			result
		} = renderHook(
			() =>
				useCountdown(null)
		);

		act(() => {
			result.current.setGamePlayable(
				true
			);
		});

		act(() => {
			result.current.resetCountdown();
		});

		expect(
			result.current.countdown
		).toBe(null);

		expect(
			result.current.gamePlayable
		).toBe(false);
	});
});