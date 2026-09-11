import {
	beforeEach,
	describe,
	expect,
	it,
	vi
} from "vitest";

import {
	act,
	renderHook
} from "@testing-library/react";

const mocks = vi.hoisted(() => ({
	setGamePlayable: vi.fn(),
	resetSession: vi.fn(),
	rankingOptions: null,

	useSocket: vi.fn(),
	useGameControls: vi.fn(),
	useGameLoop: vi.fn(),
	useMultiplayer: vi.fn(),
	useGameState: vi.fn(),
	useCountdown: vi.fn(),
	useGameSession: vi.fn(),
	useRanking: vi.fn(),
	usePenaltyReceiver: vi.fn(),
	useGameRestart: vi.fn(),
	useGameActions: vi.fn()
}));

vi.mock("../../../src/hooks/useSocket.js", () => ({
	default: mocks.useSocket
}));

vi.mock(
	"../../../src/hooks/keyboard/useGameControls.js",
	() => ({
		default: mocks.useGameControls
	})
);

vi.mock(
	"../../../src/hooks/game/useGameLoop.js",
	() => ({
		default: mocks.useGameLoop
	})
);

vi.mock(
	"../../../src/hooks/useMultiplayer.js",
	() => ({
		default: mocks.useMultiplayer
	})
);

vi.mock(
	"../../../src/hooks/game/useGameState.js",
	() => ({
		default: mocks.useGameState
	})
);

vi.mock(
	"../../../src/hooks/game/useCountdown.js",
	() => ({
		default: mocks.useCountdown
	})
);

vi.mock(
	"../../../src/hooks/game/useGameSession.js",
	() => ({
		default: mocks.useGameSession
	})
);

vi.mock(
	"../../../src/hooks/game/useRanking.js",
	() => ({
		default: mocks.useRanking
	})
);

vi.mock(
	"../../../src/hooks/game/usePenaltyReceiver.js",
	() => ({
		default: mocks.usePenaltyReceiver
	})
);

vi.mock(
	"../../../src/hooks/game/useGameRestart.js",
	() => ({
		default: mocks.useGameRestart
	})
);

vi.mock(
	"../../../src/hooks/game/useGameActions.js",
	() => ({
		default: mocks.useGameActions
	})
);

import useGameController from "../../../src/hooks/game/useGameController.js";

function configure(roomState = {
	started: false,
	hostId: "p1"
}) {
	const setBoard = vi.fn();
	const setScore = vi.fn();
	const setGameOver = vi.fn();
	const resetGameState = vi.fn();
	const setCurrentPiece = vi.fn();
	const setNextPiece = vi.fn();
	const resetCountdown = vi.fn();
	const resetRanking = vi.fn();
	const applyPenalty = vi.fn();
	const hardDropCurrentPiece = vi.fn();
	const resetClient = vi.fn();

	mocks.useSocket.mockReturnValue({
		playerId: "p1",
		roomState,
		error: null,
		currentPiece: {
			type: "O"
		},
		setCurrentPiece,
		nextPiece: {
			type: "I"
		},
		setNextPiece
	});

	mocks.useGameState.mockReturnValue({
		board: [["board"]],
		setBoard,
		score: 42,
		setScore,
		gameOver: false,
		setGameOver,
		resetGameState
	});

	mocks.useCountdown.mockReturnValue({
		countdown: 3,
		gamePlayable: true,
		setGamePlayable: mocks.setGamePlayable,
		resetCountdown
	});

	mocks.useGameSession.mockReturnValue({
		resetSession: mocks.resetSession
	});

	mocks.useRanking.mockImplementation((options) => {
		mocks.rankingOptions = options;

		return {
			showRanking: false,
			isFading: false,
			isFinishing: false,
			ranking: [],
			finishedMode: null,
			resetRanking
		};
	});

	mocks.useGameLoop.mockReturnValue({
		hardDropCurrentPiece,
		applyPenalty
	});

	mocks.useMultiplayer.mockReturnValue({
		opponents: [{
			id: "p2"
		}]
	});

	mocks.useGameRestart.mockReturnValue({
		handleRestart: vi.fn(),
		resetClient
	});

	mocks.useGameActions.mockReturnValue({
		handleModeChange: vi.fn(),
		handleStart: vi.fn(),
		handleAddBot: vi.fn(),
		handleRemoveBot: vi.fn()
	});
}

describe("useGameController", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mocks.rankingOptions = null;
		configure();
	});

	it("composes all game hooks", () => {
		const { result } = renderHook(() =>
			useGameController("alpha", "Eric")
		);

		expect(mocks.useSocket).toHaveBeenCalledWith(
			"alpha",
			"Eric"
		);

		expect(result.current.playerId).toBe("p1");
		expect(result.current.isHost).toBe(true);
		expect(result.current.score).toBe(42);
		expect(result.current.countdown).toBe(3);
		expect(result.current.showBoard).toBe(false);
		expect(result.current.opponents).toEqual([
			{
				id: "p2"
			}
		]);

		expect(
			mocks.usePenaltyReceiver
		).toHaveBeenCalled();
	});

	it("passes game controls", () => {
		renderHook(() =>
			useGameController("alpha", "Eric")
		);

		expect(
			mocks.useGameControls
		).toHaveBeenCalledWith(
			expect.objectContaining({
				started: true,
				gameOver: false
			})
		);
	});

	it("handles game-finished callback", () => {
		renderHook(() =>
			useGameController("alpha", "Eric")
		);

		act(() => {
			mocks.rankingOptions.onGameFinished();
		});

		expect(
			mocks.setGamePlayable
		).toHaveBeenCalledWith(false);

		expect(
			mocks.resetSession
		).toHaveBeenCalled();
	});

	it("detects non-host", () => {
		configure({
			started: false,
			hostId: "somebody-else"
		});

		const { result } = renderHook(() =>
			useGameController("alpha", "Eric")
		);

		expect(result.current.isHost).toBe(false);
	});

	it("shows board while round is started", () => {
		configure({
			started: true,
			hostId: "p1"
		});

		const { result } = renderHook(() =>
			useGameController("alpha", "Eric")
		);

		expect(result.current.showBoard).toBe(true);
	});
});
