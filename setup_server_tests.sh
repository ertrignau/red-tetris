#!/usr/bin/env bash
set -euo pipefail

# Red Tetris - server test bootstrap
# Run from project root or from server/

if [[ -d "server/src" ]]; then
  cd server
elif [[ -d "src" && -f "package.json" ]]; then
  :
else
  echo "Erreur: lance ce script depuis la racine de red-tetris ou depuis server/"
  exit 1
fi

echo "==> Installation des dépendances de test serveur"
npm install -D vitest@3 @vitest/coverage-v8@3 supertest

echo "==> Configuration des scripts npm"
npm pkg set scripts.test="vitest run"
npm pkg set scripts.coverage="vitest run --coverage"

echo "==> Création de l'arborescence"
mkdir -p \
  test/app \
  test/bots \
  test/classes \
  test/managers \
  test/metrics \
  test/services \
  test/socket \
  test/utils

cat > vitest.config.js <<'EOF'
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    clearMocks: true,
    restoreMocks: true,
    mockReset: true
  },
  coverage: {
    provider: "v8",
    include: ["src/**/*.js"],
    exclude: [
      "src/server.js",
      "src/protocol/events.js",
      "src/socket/playerHandlers.js"
    ],
    thresholds: {
      statements: 70,
      branches: 50,
      functions: 70,
      lines: 70
    }
  }
});
EOF

cat > test/classes/Player.test.js <<'EOF'
import { describe, expect, it } from "vitest";
import Player from "../../src/classes/Player.js";

describe("Player", () => {
  it("initializes player state", () => {
    const p = new Player("p1", "s1", "Eric");
    expect(p).toMatchObject({
      id: "p1",
      socketId: "s1",
      name: "Eric",
      alive: true,
      pieceIndex: 0,
      spectrum: [],
      score: 0,
      isHost: false
    });
  });

  it("reconnects with a new socket", () => {
    const p = new Player("p1", "s1", "Eric");
    p.reconnect("s2");
    expect(p.socketId).toBe("s2");
  });
});
EOF

cat > test/classes/Piece.test.js <<'EOF'
import { afterEach, describe, expect, it, vi } from "vitest";
import Piece from "../../src/classes/Piece.js";

describe("Piece", () => {
  afterEach(() => vi.restoreAllMocks());

  it("contains the 7 Tetrimino types", () => {
    expect(Piece.TYPES).toEqual(["I", "O", "T", "S", "Z", "J", "L"]);
  });

  it("creates valid pieces", () => {
    expect(new Piece("T").type).toBe("T");
    expect(Piece.isValidType("I")).toBe(true);
  });

  it("rejects invalid pieces", () => {
    expect(Piece.isValidType("X")).toBe(false);
    expect(() => new Piece("X")).toThrow("Invalid piece type: X");
  });

  it("generates a complete 7-bag", () => {
    const bag = Piece.generateBag();
    expect(bag).toHaveLength(7);
    expect(bag.map((p) => p.type).sort()).toEqual([...Piece.TYPES].sort());
  });

  it("keeps every piece when shuffling", () => {
    vi.spyOn(Math, "random").mockReturnValue(0);
    const bag = Piece.generateBag();
    expect(new Set(bag.map((p) => p.type)).size).toBe(7);
  });
});
EOF

cat > test/classes/Game.test.js <<'EOF'
import { describe, expect, it, vi } from "vitest";
import Game from "../../src/classes/Game.js";
import Player from "../../src/classes/Player.js";
import Piece from "../../src/classes/Piece.js";

const makePlayer = (id, socketId = `s-${id}`, name = id) =>
  new Player(id, socketId, name);

describe("Game", () => {
  it("initializes room state", () => {
    const game = new Game("room");
    expect(game.roomName).toBe("room");
    expect(game.players.size).toBe(0);
    expect(game.hostId).toBeNull();
    expect(game.started).toBe(false);
    expect(game.roundId).toBe(0);
    expect(game.mode).toBe("battle-royale");
    expect(game.activeMode).toBeNull();
  });

  it("assigns first human as host", () => {
    const game = new Game("room");
    const p = makePlayer("p1");
    game.addPlayer(p);
    expect(game.hostId).toBe("p1");
    expect(p.isHost).toBe(true);
  });

  it("never assigns host role to a bot", () => {
    const game = new Game("room");
    const bot = makePlayer("bot");
    bot.isBot = true;
    game.addPlayer(bot);
    expect(game.hostId).toBeNull();
    expect(bot.isHost).toBe(false);
  });

  it("reconnects an existing player", () => {
    const game = new Game("room");
    const old = makePlayer("p1", "old", "Old");
    game.addPlayer(old);
    const result = game.addPlayer(makePlayer("p1", "new", "New"));
    expect(result).toBe(old);
    expect(game.players.size).toBe(1);
    expect(old.socketId).toBe("new");
    expect(old.name).toBe("New");
  });

  it("transfers host to next human", () => {
    const game = new Game("room");
    const p1 = makePlayer("p1");
    const bot = makePlayer("bot");
    bot.isBot = true;
    const p2 = makePlayer("p2");
    game.addPlayer(p1);
    game.addPlayer(bot);
    game.addPlayer(p2);
    game.removePlayer("p1");
    expect(game.hostId).toBe("p2");
    expect(p2.isHost).toBe(true);
  });

  it("clears host if only bots remain", () => {
    const game = new Game("room");
    const p1 = makePlayer("p1");
    const bot = makePlayer("bot");
    bot.isBot = true;
    game.addPlayer(p1);
    game.addPlayer(bot);
    game.removePlayer("p1");
    expect(game.hostId).toBeNull();
  });

  it("ignores removal of unknown players", () => {
    const game = new Game("room");
    expect(() => game.removePlayer("missing")).not.toThrow();
  });

  it("finds players by socket", () => {
    const game = new Game("room");
    const p = makePlayer("p1", "special");
    game.addPlayer(p);
    expect(game.findPlayerBySocket("special")).toBe(p);
    expect(game.findPlayerBySocket("none")).toBeNull();
  });

  it("returns players as an array", () => {
    const game = new Game("room");
    game.addPlayer(makePlayer("p1"));
    game.addPlayer(makePlayer("p2"));
    expect(game.getPlayers()).toHaveLength(2);
  });

  it("accepts only supported modes", () => {
    const game = new Game("room");
    expect(game.setMode("points")).toBe(true);
    expect(game.mode).toBe("points");
    expect(game.setMode("battle-royale")).toBe(true);
    expect(game.setMode("invalid")).toBe(false);
  });

  it("creates immutable-style ranking snapshots", () => {
    const game = new Game("room");
    const p = makePlayer("p1", "s1", "Eric");
    p.score = 123;
    p.isBot = true;
    expect(game.createPlayerSnapshot(p)).toEqual({
      id: "p1",
      name: "Eric",
      score: 123,
      isBot: true
    });
  });

  it("marks players dead once", () => {
    const game = new Game("room");
    const p = makePlayer("p1");
    game.addPlayer(p);
    game.markPlayerDead("p1");
    game.markPlayerDead("p1");
    game.markPlayerDead("missing");
    expect(p.alive).toBe(false);
    expect(game.eliminationOrder).toHaveLength(1);
  });

  it("records departed players once", () => {
    const game = new Game("room");
    const p = makePlayer("p1");
    game.recordDepartedPlayer(p);
    game.recordDepartedPlayer(p);
    expect(game.departedPlayers).toHaveLength(1);
  });

  it("returns alive players and finished state", () => {
    const game = new Game("room");
    const p1 = makePlayer("p1");
    const p2 = makePlayer("p2");
    game.addPlayer(p1);
    game.addPlayer(p2);
    p1.alive = false;
    expect(game.getAlivePlayers()).toEqual([p2]);
    expect(game.isFinished()).toBe(false);
    p2.alive = false;
    expect(game.isFinished()).toBe(true);
  });

  it("reverses elimination order for Battle Royale ranking", () => {
    const game = new Game("room");
    const p1 = makePlayer("p1");
    const p2 = makePlayer("p2");
    game.addPlayer(p1);
    game.addPlayer(p2);
    game.markPlayerDead("p1");
    game.markPlayerDead("p2");
    expect(game.getRanking().map((p) => p.id)).toEqual(["p2", "p1"]);
  });

  it("sorts points ranking and removes duplicate ids", () => {
    const game = new Game("room");
    const p1 = makePlayer("p1");
    const p2 = makePlayer("p2");
    p1.score = 100;
    p2.score = 500;
    game.addPlayer(p1);
    game.addPlayer(p2);
    game.departedPlayers.push({ id: "p1", name: "old", score: 20 });
    expect(game.getPointsRanking().map((p) => p.id)).toEqual(["p2", "p1"]);
  });

  it("generates a shared sequence", () => {
    const game = new Game("room");
    const spy = vi.spyOn(game, "generateBag").mockReturnValue([new Piece("I")]);
    game.generateSequence(3);
    expect(spy).toHaveBeenCalledTimes(3);
    expect(game.pieces).toHaveLength(3);
  });

  it("uses independent indices over the same shared sequence", () => {
    const game = new Game("room");
    game.pieces = [new Piece("I"), new Piece("T")];
    const p1 = makePlayer("p1");
    const p2 = makePlayer("p2");

    expect(game.peekNextPiece(p1)).toBe("I");
    expect(game.getNextPiece(p1)).toBe("I");
    expect(game.getNextPiece(p2)).toBe("I");
    expect(game.getNextPiece(p1)).toBe("T");
    expect(game.getNextPiece(p1)).toBeNull();
    expect(game.peekNextPiece(p1)).toBeNull();
  });
});
EOF

cat > test/managers/GameManager.test.js <<'EOF'
import { describe, expect, it } from "vitest";
import GameManager from "../../src/managers/GameManager.js";
import Player from "../../src/classes/Player.js";
import { MAX_PLAYERS } from "../../../shared/constants.js";

describe("GameManager", () => {
  it("creates, gets and removes games", () => {
    const manager = new GameManager();
    const game = manager.createGame("alpha");
    expect(manager.getGame("alpha")).toBe(game);
    expect(manager.hasGame("alpha")).toBe(true);
    manager.removeGame("alpha");
    expect(manager.hasGame("alpha")).toBe(false);
  });

  it("reuses existing games", () => {
    const manager = new GameManager();
    expect(manager.getOrCreateGame("alpha")).toBe(manager.getOrCreateGame("alpha"));
    expect(manager.games.size).toBe(1);
  });

  it("finds a game by socket", () => {
    const manager = new GameManager();
    const game = manager.createGame("alpha");
    game.addPlayer(new Player("p1", "s1", "Eric"));
    expect(manager.findGameBySocket("s1")).toBe(game);
    expect(manager.findGameBySocket("missing")).toBeNull();
  });

  it("finds an available matchmaking room", () => {
    const manager = new GameManager();
    const started = manager.createGame("started");
    started.started = true;
    const available = manager.createGame("available");
    expect(manager.findAvailableGame()).toBe(available);
  });

  it("skips full rooms", () => {
    const manager = new GameManager();
    const game = manager.createGame("full");
    for (let i = 0; i < MAX_PLAYERS; i++) {
      game.addPlayer(new Player(`p${i}`, `s${i}`, `P${i}`));
    }
    expect(manager.findAvailableGame()).toBeNull();
  });
});
EOF

cat > test/bots/botBoard.test.js <<'EOF'
import { describe, expect, it } from "vitest";
import {
  BOT_BOARD_HEIGHT,
  BOT_BOARD_WIDTH,
  addBotPenaltyLines,
  calculateBotSpectrum,
  clearBotLines,
  cloneBotBoard,
  createBotBoard,
  hasBotCollision,
  lockBotPiece
} from "../../src/bots/botBoard.js";

describe("botBoard", () => {
  it("creates an empty 10x20 board", () => {
    const board = createBotBoard();
    expect(board).toHaveLength(BOT_BOARD_HEIGHT);
    expect(board[0]).toHaveLength(BOT_BOARD_WIDTH);
    expect(board.flat().every((c) => c === null)).toBe(true);
  });

  it("clones without sharing rows", () => {
    const board = createBotBoard();
    const copy = cloneBotBoard(board);
    copy[0][0] = "I";
    expect(board[0][0]).toBeNull();
  });

  it("detects walls, floor and occupied cells", () => {
    const board = createBotBoard();
    expect(hasBotCollision(board, [[1]], 0, 0)).toBe(false);
    expect(hasBotCollision(board, [[1]], -1, 0)).toBe(true);
    expect(hasBotCollision(board, [[1]], 10, 0)).toBe(true);
    expect(hasBotCollision(board, [[1]], 0, 20)).toBe(true);
    board[5][5] = "T";
    expect(hasBotCollision(board, [[1]], 5, 5)).toBe(true);
  });

  it("ignores empty shape cells", () => {
    const board = createBotBoard();
    expect(hasBotCollision(board, [[0, 1]], -1, 0)).toBe(false);
  });

  it("locks pieces immutably", () => {
    const board = createBotBoard();
    const next = lockBotPiece(board, [[1, 1], [1, 1]], "O", 4, 18);
    expect(board[18][4]).toBeNull();
    expect(next[18][4]).toBe("O");
    expect(next[19][5]).toBe("O");
  });

  it("clears normal full lines", () => {
    const board = createBotBoard();
    board[19] = Array(10).fill("I");
    const result = clearBotLines(board);
    expect(result.clearedLines).toBe(1);
    expect(result.board[0]).toEqual(Array(10).fill(null));
  });

  it("keeps indestructible penalty rows", () => {
    const board = createBotBoard();
    board[19] = Array(10).fill("P");
    expect(clearBotLines(board).clearedLines).toBe(0);
  });

  it("sanitizes and adds penalty lines", () => {
    const board = createBotBoard();
    expect(addBotPenaltyLines(board, 0)).toBe(board);
    const result = addBotPenaltyLines(board, 2.9);
    expect(result.slice(-2)).toEqual([
      Array(10).fill("P"),
      Array(10).fill("P")
    ]);
  });

  it("clamps penalty count", () => {
    const board = addBotPenaltyLines(createBotBoard(), 999);
    expect(board.every((row) => row.every((c) => c === "P"))).toBe(true);
  });

  it("calculates spectrum heights", () => {
    const board = createBotBoard();
    board[19][0] = "I";
    board[10][1] = "T";
    const spectrum = calculateBotSpectrum(board);
    expect(spectrum[0]).toBe(1);
    expect(spectrum[1]).toBe(10);
    expect(spectrum[2]).toBe(0);
  });
});
EOF

cat > test/bots/botDifficulty.test.js <<'EOF'
import { describe, expect, it } from "vitest";
import { BOT_DIFFICULTIES, getBotDifficulty } from "../../src/bots/botDifficulty.js";

describe("botDifficulty", () => {
  it("returns requested config", () => {
    expect(getBotDifficulty("hard")).toBe(BOT_DIFFICULTIES.hard);
  });

  it("falls back to medium", () => {
    expect(getBotDifficulty("unknown")).toBe(BOT_DIFFICULTIES.medium);
  });
});
EOF

cat > test/bots/botEvaluation.test.js <<'EOF'
import { describe, expect, it } from "vitest";
import { evaluateBotBoard } from "../../src/bots/botEvaluation.js";

const emptyBoard = () => Array.from({ length: 20 }, () => Array(10).fill(null));

const weights = {
  lines: 10,
  holes: -5,
  height: -2,
  bumpiness: -1
};

describe("botEvaluation", () => {
  it("scores an empty board at zero", () => {
    expect(evaluateBotBoard({ board: emptyBoard(), clearedLines: 0, weights })).toBe(0);
  });

  it("rewards cleared lines", () => {
    expect(evaluateBotBoard({ board: emptyBoard(), clearedLines: 2, weights })).toBe(20);
  });

  it("penalizes height, holes and bumpiness", () => {
    const board = emptyBoard();
    board[17][0] = "I";
    board[19][0] = "I";
    board[19][1] = "I";
    expect(evaluateBotBoard({ board, clearedLines: 0, weights })).toBeLessThan(0);
  });
});
EOF

cat > test/bots/botPlayer.test.js <<'EOF'
import { describe, expect, it } from "vitest";
import BotPlayer from "../../src/bots/botPlayer.js";
import Player from "../../src/classes/Player.js";

describe("BotPlayer", () => {
  it("extends Player and owns a board", () => {
    const bot = new BotPlayer({
      playerId: "bot1",
      name: "Bot",
      difficulty: "hard"
    });

    expect(bot instanceof Player).toBe(true);
    expect(bot.isBot).toBe(true);
    expect(bot.socketId).toBeNull();
    expect(bot.difficulty).toBe("hard");
    expect(bot.board).toHaveLength(20);
  });

  it("resets bot state", () => {
    const bot = new BotPlayer({
      playerId: "bot1",
      name: "Bot",
      difficulty: "easy"
    });

    bot.alive = false;
    bot.pieceIndex = 8;
    bot.spectrum = [5];
    bot.score = 900;
    bot.board[0][0] = "I";

    bot.resetBot();

    expect(bot.alive).toBe(true);
    expect(bot.pieceIndex).toBe(0);
    expect(bot.spectrum).toEqual([]);
    expect(bot.score).toBe(0);
    expect(bot.board[0][0]).toBeNull();
  });
});
EOF

cat > test/bots/botProfiles.test.js <<'EOF'
import { afterEach, describe, expect, it, vi } from "vitest";
import { BOT_PROFILES, getRandomBotProfile } from "../../src/bots/botProfiles.js";

describe("botProfiles", () => {
  afterEach(() => vi.restoreAllMocks());

  it("contains usable profiles", () => {
    expect(BOT_PROFILES.length).toBeGreaterThan(0);
    expect(BOT_PROFILES.every((p) => p.name && p.difficulty)).toBe(true);
  });

  it("returns a profile using Math.random", () => {
    vi.spyOn(Math, "random").mockReturnValue(0);
    expect(getRandomBotProfile()).toBe(BOT_PROFILES[0]);
  });
});
EOF

cat > test/bots/botController.test.js <<'EOF'
import { afterEach, describe, expect, it, vi } from "vitest";
import BotController from "../../src/bots/botController.js";
import BotPlayer from "../../src/bots/botPlayer.js";

const makeBot = (difficulty = "expert") =>
  new BotPlayer({
    playerId: "bot1",
    name: "Bot",
    difficulty
  });

describe("BotController", () => {
  afterEach(() => vi.restoreAllMocks());

  it("returns bot difficulty", () => {
    expect(new BotController(makeBot("hard")).getConfig().thinkDelay).toBe(450);
  });

  it("returns no moves for invalid piece", () => {
    expect(new BotController(makeBot()).findMoves("X")).toEqual([]);
  });

  it("finds legal moves", () => {
    const moves = new BotController(makeBot()).findMoves("T");
    expect(moves.length).toBeGreaterThan(0);
    expect(moves[0]).toEqual(expect.objectContaining({
      x: expect.any(Number),
      y: expect.any(Number),
      score: expect.any(Number)
    }));
  });

  it("returns null for no candidate", () => {
    expect(new BotController(makeBot()).selectMove([])).toBeNull();
  });

  it("selects best move in expert mode", () => {
    const controller = new BotController(makeBot("expert"));
    const best = { score: 100 };
    expect(controller.selectMove([{ score: 1 }, best, { score: 50 }])).toBe(best);
  });

  it("can intentionally choose an imperfect move", () => {
    const controller = new BotController(makeBot("easy"));
    const random = vi.spyOn(Math, "random");
    random.mockReturnValueOnce(0).mockReturnValueOnce(0.9);
    expect(controller.selectMove([
      { score: 100 },
      { score: 90 },
      { score: 80 }
    ])).toBeDefined();
  });

  it("chooseMove combines search and selection", () => {
    expect(new BotController(makeBot()).chooseMove("O")).toBeTruthy();
  });
});
EOF

cat > test/services/disconnectTimers.test.js <<'EOF'
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createDisconnectTimers } from "../../src/services/disconnectTimers.js";

describe("disconnectTimers", () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it("runs scheduled callbacks", () => {
    const timers = createDisconnectTimers();
    const callback = vi.fn();
    timers.schedule("room", "p1", 1000, callback);
    vi.advanceTimersByTime(1000);
    expect(callback).toHaveBeenCalledOnce();
  });

  it("cancels timers", () => {
    const timers = createDisconnectTimers();
    const callback = vi.fn();
    timers.schedule("room", "p1", 1000, callback);
    timers.cancel("room", "p1");
    vi.advanceTimersByTime(1000);
    expect(callback).not.toHaveBeenCalled();
  });

  it("replaces an existing timer for the same player", () => {
    const timers = createDisconnectTimers();
    const first = vi.fn();
    const second = vi.fn();
    timers.schedule("room", "p1", 1000, first);
    timers.schedule("room", "p1", 1000, second);
    vi.advanceTimersByTime(1000);
    expect(first).not.toHaveBeenCalled();
    expect(second).toHaveBeenCalledOnce();
  });

  it("ignores cancel when no timer exists", () => {
    expect(() => createDisconnectTimers().cancel("room", "missing")).not.toThrow();
  });
});
EOF

cat > test/services/roomState.test.js <<'EOF'
import { describe, expect, it, vi } from "vitest";
import Game from "../../src/classes/Game.js";
import Player from "../../src/classes/Player.js";
import { buildRoomState, emitRoomState } from "../../src/services/roomState.js";

describe("roomState", () => {
  it("builds solo lobby state", () => {
    const game = new Game("alpha");
    game.addPlayer(new Player("p1", "s1", "Eric"));
    const state = buildRoomState(game);
    expect(state).toEqual(expect.objectContaining({
      room: "alpha",
      started: false,
      hostId: "p1",
      mode: "solo"
    }));
    expect(state.players[0]).toEqual(expect.objectContaining({
      playerId: "p1",
      name: "Eric",
      isHost: true,
      isBot: false,
      alive: true,
      score: 0
    }));
  });

  it("uses configured mode in multiplayer lobby", () => {
    const game = new Game("alpha");
    game.addPlayer(new Player("p1", "s1", "A"));
    game.addPlayer(new Player("p2", "s2", "B"));
    game.mode = "points";
    expect(buildRoomState(game).mode).toBe("points");
  });

  it("uses active mode while started", () => {
    const game = new Game("alpha");
    game.started = true;
    game.activeMode = "battle-royale";
    expect(buildRoomState(game).mode).toBe("battle-royale");
  });

  it("emits state to the room", () => {
    const game = new Game("alpha");
    const emit = vi.fn();
    const io = { to: vi.fn(() => ({ emit })) };
    emitRoomState(io, game);
    expect(io.to).toHaveBeenCalledWith("alpha");
    expect(emit).toHaveBeenCalledWith(
      "room:state",
      expect.objectContaining({ room: "alpha" })
    );
  });
});
EOF

cat > test/services/gameResult.test.js <<'EOF'
import { describe, expect, it, vi } from "vitest";
import Game from "../../src/classes/Game.js";
import Player from "../../src/classes/Player.js";
import {
  buildRanking,
  finishGame,
  resolveGameAfterDeparture
} from "../../src/services/gameResult.js";

const makeIo = () => {
  const emit = vi.fn();
  return {
    emit,
    io: { to: vi.fn(() => ({ emit })) }
  };
};

const makePlayer = (id, score = 0) => {
  const p = new Player(id, `s-${id}`, id);
  p.score = score;
  return p;
};

describe("gameResult", () => {
  it("builds numbered ranking entries", () => {
    const game = new Game("alpha");
    game.hostId = "p1";
    const ranking = buildRanking(game, [makePlayer("p1", 100), makePlayer("p2", 50)]);
    expect(ranking[0]).toEqual(expect.objectContaining({
      position: 1,
      playerId: "p1",
      score: 100,
      isHost: true,
      isBot: false
    }));
    expect(ranking[1].position).toBe(2);
  });

  it("ignores already stopped games", () => {
    const game = new Game("alpha");
    const { io, emit } = makeIo();
    finishGame(io, game, []);
    expect(emit).not.toHaveBeenCalledWith("game:finished", expect.anything());
  });

  it("finishes and emits an active game", () => {
    const game = new Game("alpha");
    const p = makePlayer("p1");
    game.addPlayer(p);
    game.started = true;
    game.activeMode = "solo";
    game.startedAt = Date.now() - 1000;
    game.countdownEndsAt = 123;
    const { io, emit } = makeIo();

    finishGame(io, game, [p]);

    expect(game.started).toBe(false);
    expect(game.startedAt).toBeNull();
    expect(game.countdownEndsAt).toBeNull();
    expect(emit).toHaveBeenCalledWith(
      "game:finished",
      expect.objectContaining({ mode: "solo" })
    );
  });

  it("does not resolve when game is stopped", () => {
    const game = new Game("alpha");
    const { io } = makeIo();
    expect(resolveGameAfterDeparture(io, game)).toBe(false);
  });

  it("keeps Battle Royale alive with 2+ survivors", () => {
    const game = new Game("alpha");
    game.addPlayer(makePlayer("p1"));
    game.addPlayer(makePlayer("p2"));
    game.started = true;
    game.activeMode = "battle-royale";
    const { io } = makeIo();
    expect(resolveGameAfterDeparture(io, game)).toBe(false);
  });

  it("finishes Battle Royale with one survivor", () => {
    const game = new Game("alpha");
    game.addPlayer(makePlayer("p1"));
    game.addPlayer(makePlayer("p2"));
    game.started = true;
    game.activeMode = "battle-royale";
    game.markPlayerDead("p2");
    const { io } = makeIo();
    expect(resolveGameAfterDeparture(io, game)).toBe(true);
    expect(game.started).toBe(false);
  });

  it("keeps points mode running while a player is alive", () => {
    const game = new Game("alpha");
    game.addPlayer(makePlayer("p1"));
    game.started = true;
    game.activeMode = "points";
    const { io } = makeIo();
    expect(resolveGameAfterDeparture(io, game)).toBe(false);
  });

  it("finishes points mode when everybody is dead", () => {
    const game = new Game("alpha");
    const p = makePlayer("p1", 500);
    game.addPlayer(p);
    p.alive = false;
    game.started = true;
    game.activeMode = "points";
    const { io } = makeIo();
    expect(resolveGameAfterDeparture(io, game)).toBe(true);
  });
});
EOF

cat > test/services/roomLifecycle.test.js <<'EOF'
import { describe, expect, it, vi } from "vitest";
import Game from "../../src/classes/Game.js";
import Player from "../../src/classes/Player.js";
import { removePlayerFromGame } from "../../src/services/roomLifecycle.js";

const makeIo = () => ({ to: vi.fn(() => ({ emit: vi.fn() })) });

describe("roomLifecycle", () => {
  it("reports missing players", () => {
    const game = new Game("alpha");
    expect(removePlayerFromGame({
      io: makeIo(),
      gameManager: { removeGame: vi.fn() },
      game,
      playerId: "missing"
    })).toEqual({
      removed: false,
      finished: false
    });
  });

  it("removes final player and room", () => {
    const game = new Game("alpha");
    game.addPlayer(new Player("p1", "s1", "Eric"));
    const gameManager = { removeGame: vi.fn() };
    const result = removePlayerFromGame({
      io: makeIo(),
      gameManager,
      game,
      playerId: "p1"
    });

    expect(gameManager.removeGame).toHaveBeenCalledWith("alpha");
    expect(result).toEqual(expect.objectContaining({
      removed: true,
      roomRemoved: true,
      wasHost: true
    }));
  });

  it("records an active-game departure", () => {
    const game = new Game("alpha");
    game.addPlayer(new Player("p1", "s1", "A"));
    game.addPlayer(new Player("p2", "s2", "B"));
    game.addPlayer(new Player("p3", "s3", "C"));
    game.started = true;
    game.activeMode = "battle-royale";

    const result = removePlayerFromGame({
      io: makeIo(),
      gameManager: { removeGame: vi.fn() },
      game,
      playerId: "p3"
    });

    expect(result.removed).toBe(true);
    expect(game.departedPlayers.some((p) => p.id === "p3")).toBe(true);
    expect(game.eliminationOrder.some((p) => p.id === "p3")).toBe(true);
  });

  it("emits room state when the game does not finish", () => {
    const game = new Game("alpha");
    game.addPlayer(new Player("p1", "s1", "A"));
    game.addPlayer(new Player("p2", "s2", "B"));
    const io = makeIo();

    const result = removePlayerFromGame({
      io,
      gameManager: { removeGame: vi.fn() },
      game,
      playerId: "p2"
    });

    expect(result.finished).toBe(false);
    expect(io.to).toHaveBeenCalledWith("alpha");
  });
});
EOF

cat > test/utils/validation.test.js <<'EOF'
import { describe, expect, it } from "vitest";
import {
  validatePlayerId,
  validateRoom,
  validateUsername
} from "../../src/utils/validation.js";

describe("validation", () => {
  it("validates usernames", () => {
    expect(validateUsername(null)).toBe("Invalid username");
    expect(validateUsername("ab")).toMatch(/between 3 and 16/);
    expect(validateUsername("x".repeat(17))).toMatch(/between 3 and 16/);
    expect(validateUsername("Eric")).toBeNull();
  });

  it("validates room names", () => {
    expect(validateRoom(null)).toBe("Invalid room");
    expect(validateRoom("ab")).toMatch(/between 3 and 20/);
    expect(validateRoom("x".repeat(21))).toMatch(/between 3 and 20/);
    expect(validateRoom("bad room!")).toMatch(/only contain/);
    expect(validateRoom("room_42-test")).toBeNull();
  });

  it("validates player ids", () => {
    expect(validatePlayerId(null)).toBe("Invalid player id");
    expect(validatePlayerId("")).toBe("Invalid player id");
    expect(validatePlayerId("x".repeat(129))).toBe("Invalid player id");
    expect(validatePlayerId("player-id")).toBeNull();
  });
});
EOF

cat > test/utils/roomName.test.js <<'EOF'
import { afterEach, describe, expect, it, vi } from "vitest";
import { generateMatchmakingRoom } from "../../src/utils/roomName.js";

describe("roomName", () => {
  afterEach(() => vi.restoreAllMocks());

  it("generates a match-* room", () => {
    expect(generateMatchmakingRoom()).toMatch(/^match-/);
  });

  it("uses Math.random", () => {
    vi.spyOn(Math, "random").mockReturnValue(0.5);
    expect(generateMatchmakingRoom()).toMatch(/^match-/);
  });
});
EOF

cat > test/socket/pieceHandlers.test.js <<'EOF'
import { describe, expect, it, vi } from "vitest";
import { registerPieceHandlers } from "../../src/socket/pieceHandlers.js";

const createSocket = () => {
  const handlers = {};
  return {
    handlers,
    socket: {
      id: "s1",
      on: vi.fn((event, cb) => { handlers[event] = cb; }),
      emit: vi.fn()
    }
  };
};

describe("pieceHandlers", () => {
  it("sends current and next pieces", () => {
    const { socket, handlers } = createSocket();
    const player = { name: "Eric", alive: true, pieceIndex: 0 };
    const game = {
      started: true,
      findPlayerBySocket: () => player,
      getNextPiece: vi.fn(() => "T"),
      peekNextPiece: vi.fn(() => "I")
    };

    registerPieceHandlers({
      socket,
      gameManager: { getGame: () => game }
    });

    handlers["piece:next"]({ room: "alpha" });

    expect(socket.emit).toHaveBeenCalledWith("piece:next", {
      piece: "T",
      nextPiece: "I"
    });
  });

  it("ignores inactive games", () => {
    const { socket, handlers } = createSocket();
    registerPieceHandlers({
      socket,
      gameManager: { getGame: () => null }
    });
    handlers["piece:next"]({ room: "alpha" });
    expect(socket.emit).not.toHaveBeenCalled();
  });

  it("ignores dead players", () => {
    const { socket, handlers } = createSocket();
    registerPieceHandlers({
      socket,
      gameManager: {
        getGame: () => ({
          started: true,
          findPlayerBySocket: () => ({ alive: false })
        })
      }
    });
    handlers["piece:next"]({ room: "alpha" });
    expect(socket.emit).not.toHaveBeenCalled();
  });

  it("does nothing when sequence ends", () => {
    const { socket, handlers } = createSocket();
    registerPieceHandlers({
      socket,
      gameManager: {
        getGame: () => ({
          started: true,
          findPlayerBySocket: () => ({ alive: true }),
          getNextPiece: () => null
        })
      }
    });
    handlers["piece:next"]({ room: "alpha" });
    expect(socket.emit).not.toHaveBeenCalled();
  });
});
EOF

cat > test/socket/spectrumHandlers.test.js <<'EOF'
import { describe, expect, it, vi } from "vitest";
import { registerSpectrumHandlers } from "../../src/socket/spectrumHandlers.js";

const createSocket = () => {
  const handlers = {};
  const emit = vi.fn();
  return {
    handlers,
    emit,
    socket: {
      id: "s1",
      on: vi.fn((event, cb) => { handlers[event] = cb; }),
      to: vi.fn(() => ({ emit }))
    }
  };
};

describe("spectrumHandlers", () => {
  it("updates and broadcasts spectrum", () => {
    const { socket, handlers, emit } = createSocket();
    const player = { id: "p1", name: "Eric", alive: true, spectrum: [] };
    const game = {
      started: true,
      findPlayerBySocket: () => player
    };

    registerSpectrumHandlers({
      socket,
      gameManager: { getGame: () => game }
    });

    handlers["spectrum:update"]({
      room: "alpha",
      spectrum: [1, 2, 3]
    });

    expect(player.spectrum).toEqual([1, 2, 3]);
    expect(emit).toHaveBeenCalledWith("spectrum:update", {
      playerId: "p1",
      playerName: "Eric",
      spectrum: [1, 2, 3]
    });
  });

  it("ignores inactive games", () => {
    const { socket, handlers, emit } = createSocket();
    registerSpectrumHandlers({
      socket,
      gameManager: { getGame: () => null }
    });
    handlers["spectrum:update"]({ room: "alpha", spectrum: [] });
    expect(emit).not.toHaveBeenCalled();
  });

  it("ignores dead players", () => {
    const { socket, handlers, emit } = createSocket();
    registerSpectrumHandlers({
      socket,
      gameManager: {
        getGame: () => ({
          started: true,
          findPlayerBySocket: () => ({ alive: false })
        })
      }
    });
    handlers["spectrum:update"]({ room: "alpha", spectrum: [1] });
    expect(emit).not.toHaveBeenCalled();
  });
});
EOF

cat > test/socket/penaltyHandlers.test.js <<'EOF'
import { describe, expect, it, vi } from "vitest";
import { registerPenaltyHandlers } from "../../src/socket/penaltyHandlers.js";

const createSocket = () => {
  const handlers = {};
  return {
    handlers,
    socket: {
      id: "s-attacker",
      on: vi.fn((event, cb) => { handlers[event] = cb; })
    }
  };
};

const createIo = () => {
  const emit = vi.fn();
  return {
    emit,
    io: { to: vi.fn(() => ({ emit })) }
  };
};

describe("penaltyHandlers", () => {
  it("sends penalty to human and bot targets", () => {
    const { socket, handlers } = createSocket();
    const { io, emit } = createIo();
    const attacker = { id: "p1", name: "Eric", alive: true };
    const human = { id: "p2", name: "Human", alive: true, socketId: "s2" };
    const bot = { id: "bot", name: "Bot", alive: true, isBot: true };
    const game = {
      started: true,
      players: new Map([["p1", attacker], ["p2", human], ["bot", bot]]),
      findPlayerBySocket: () => attacker
    };
    const botRunner = { applyPenalty: vi.fn() };

    registerPenaltyHandlers({
      io,
      socket,
      gameManager: { getGame: () => game },
      botRunner
    });

    handlers["penalty:send"]({ room: "alpha", count: 2 });

    expect(emit).toHaveBeenCalledWith("penalty:add", {
      count: 2,
      from: "Eric"
    });
    expect(botRunner.applyPenalty).toHaveBeenCalledWith(
      game,
      bot,
      2,
      "Eric"
    );
  });

  it("clamps penalties to 3", () => {
    const { socket, handlers } = createSocket();
    const { io, emit } = createIo();
    const attacker = { id: "p1", name: "Eric", alive: true };
    const target = { id: "p2", alive: true, socketId: "target" };

    registerPenaltyHandlers({
      io,
      socket,
      gameManager: {
        getGame: () => ({
          started: true,
          players: new Map([["p1", attacker], ["p2", target]]),
          findPlayerBySocket: () => attacker
        })
      },
      botRunner: { applyPenalty: vi.fn() }
    });

    handlers["penalty:send"]({ room: "alpha", count: 999 });

    expect(emit).toHaveBeenCalledWith(
      "penalty:add",
      expect.objectContaining({ count: 3 })
    );
  });

  it("ignores invalid penalty counts", () => {
    const { socket, handlers } = createSocket();
    const { io, emit } = createIo();

    registerPenaltyHandlers({
      io,
      socket,
      gameManager: {
        getGame: () => ({
          started: true,
          players: new Map(),
          findPlayerBySocket: () => ({ id: "p1", alive: true })
        })
      },
      botRunner: { applyPenalty: vi.fn() }
    });

    handlers["penalty:send"]({ room: "alpha", count: "bad" });
    expect(emit).not.toHaveBeenCalled();
  });

  it("ignores inactive games", () => {
    const { socket, handlers } = createSocket();
    const { io, emit } = createIo();
    registerPenaltyHandlers({
      io,
      socket,
      gameManager: { getGame: () => null },
      botRunner: { applyPenalty: vi.fn() }
    });
    handlers["penalty:send"]({ room: "alpha", count: 2 });
    expect(emit).not.toHaveBeenCalled();
  });
});
EOF

cat > test/socket/gameHandlers.test.js <<'EOF'
import { describe, expect, it, vi } from "vitest";
import Game from "../../src/classes/Game.js";
import Player from "../../src/classes/Player.js";
import { registerGameHandlers } from "../../src/socket/gameHandlers.js";

function setup(playerCount = 2) {
  const game = new Game("alpha");
  const host = new Player("p1", "s1", "Eric");
  game.addPlayer(host);

  if (playerCount > 1) {
    game.addPlayer(new Player("p2", "s2", "Rocket"));
  }

  const handlers = {};
  const roomEmit = vi.fn();
  const socket = {
    id: "s1",
    on: vi.fn((event, cb) => { handlers[event] = cb; })
  };
  const io = {
    to: vi.fn(() => ({ emit: roomEmit }))
  };
  const botRunner = {
    startGame: vi.fn()
  };

  registerGameHandlers({
    io,
    socket,
    gameManager: { getGame: () => game },
    botRunner
  });

  return { game, host, handlers, roomEmit, botRunner };
}

describe("gameHandlers", () => {
  it("lets host change multiplayer mode", () => {
    const { game, handlers } = setup();
    handlers["game:mode"]({ room: "alpha", mode: "points" });
    expect(game.mode).toBe("points");
  });

  it("does not change mode in solo lobby", () => {
    const { game, handlers } = setup(1);
    handlers["game:mode"]({ room: "alpha", mode: "points" });
    expect(game.mode).toBe("battle-royale");
  });

  it("starts multiplayer game", () => {
    const { game, handlers, botRunner } = setup();
    handlers["game:start"]({ room: "alpha" });
    expect(game.started).toBe(true);
    expect(game.roundId).toBe(1);
    expect(game.activeMode).toBe("battle-royale");
    expect(game.pieces.length).toBeGreaterThan(0);
    expect(game.countdownEndsAt).toBeTypeOf("number");
    expect(botRunner.startGame).toHaveBeenCalledWith(game);
  });

  it("starts solo game as solo", () => {
    const { game, handlers } = setup(1);
    handlers["game:start"]({ room: "alpha" });
    expect(game.activeMode).toBe("solo");
  });

  it("updates valid score", () => {
    const { game, host, handlers } = setup();
    game.started = true;
    handlers["score:update"]({ room: "alpha", score: 42.9 });
    expect(host.score).toBe(42);
  });

  it("rejects invalid scores", () => {
    const { game, host, handlers } = setup();
    game.started = true;
    handlers["score:update"]({ room: "alpha", score: -1 });
    expect(host.score).toBe(0);
  });

  it("finishes Battle Royale when only one player remains", () => {
    const { game, host, handlers } = setup();
    game.started = true;
    game.activeMode = "battle-royale";
    handlers["player:dead"]({ room: "alpha" });
    expect(host.alive).toBe(false);
    expect(game.started).toBe(false);
  });

  it("lets host restart to lobby", () => {
    const { game, host, handlers, roomEmit } = setup();
    game.started = true;
    game.activeMode = "battle-royale";
    host.alive = false;
    host.score = 500;
    host.pieceIndex = 3;
    host.spectrum = [4];

    handlers["game:restart"]({ room: "alpha" });

    expect(game.started).toBe(false);
    expect(game.activeMode).toBeNull();
    expect(host.alive).toBe(true);
    expect(host.score).toBe(0);
    expect(host.pieceIndex).toBe(0);
    expect(host.spectrum).toEqual([]);
    expect(roomEmit).toHaveBeenCalledWith("game:restart");
  });
});
EOF

cat > test/socket/roomHandlers.test.js <<'EOF'
import { describe, expect, it, vi } from "vitest";
import GameManager from "../../src/managers/GameManager.js";
import { registerRoomHandlers } from "../../src/socket/roomHandlers.js";

const makeIo = () => ({ to: vi.fn(() => ({ emit: vi.fn() })) });

const makeSocket = (id = "s1") => {
  const handlers = {};
  return {
    handlers,
    socket: {
      id,
      data: {},
      on: vi.fn((event, cb) => { handlers[event] = cb; }),
      emit: vi.fn(),
      join: vi.fn(),
      leave: vi.fn()
    }
  };
};

describe("roomHandlers", () => {
  it("rejects invalid payload", () => {
    const { socket, handlers } = makeSocket();
    registerRoomHandlers({
      io: makeIo(),
      socket,
      gameManager: new GameManager(),
      disconnectTimers: { cancel: vi.fn() }
    });

    handlers["room:join"]({
      room: null,
      player: null,
      playerId: "p1"
    });

    expect(socket.emit).toHaveBeenCalledWith(
      "room:error",
      { message: "Invalid room or username" }
    );
  });

  it("creates and joins a room", () => {
    const { socket, handlers } = makeSocket();
    const manager = new GameManager();

    registerRoomHandlers({
      io: makeIo(),
      socket,
      gameManager: manager,
      disconnectTimers: { cancel: vi.fn() }
    });

    handlers["room:join"]({
      room: "alpha",
      player: "Eric",
      playerId: "p1"
    });

    const game = manager.getGame("alpha");
    expect(game.getPlayer("p1").name).toBe("Eric");
    expect(socket.join).toHaveBeenCalledWith("alpha");
    expect(socket.data).toEqual({
      room: "alpha",
      playerId: "p1"
    });
  });

  it("reconnects an existing player", () => {
    const manager = new GameManager();

    const first = makeSocket("s1");
    registerRoomHandlers({
      io: makeIo(),
      socket: first.socket,
      gameManager: manager,
      disconnectTimers: { cancel: vi.fn() }
    });
    first.handlers["room:join"]({
      room: "alpha",
      player: "Eric",
      playerId: "p1"
    });

    const second = makeSocket("s2");
    registerRoomHandlers({
      io: makeIo(),
      socket: second.socket,
      gameManager: manager,
      disconnectTimers: { cancel: vi.fn() }
    });
    second.handlers["room:join"]({
      room: "alpha",
      player: "Eric2",
      playerId: "p1"
    });

    const p = manager.getGame("alpha").getPlayer("p1");
    expect(manager.getGame("alpha").getPlayers()).toHaveLength(1);
    expect(p.socketId).toBe("s2");
    expect(p.name).toBe("Eric2");
  });

  it("rejects a new player once game started", () => {
    const manager = new GameManager();
    const game = manager.createGame("alpha");
    game.started = true;

    const { socket, handlers } = makeSocket();
    registerRoomHandlers({
      io: makeIo(),
      socket,
      gameManager: manager,
      disconnectTimers: { cancel: vi.fn() }
    });

    handlers["room:join"]({
      room: "alpha",
      player: "Eric",
      playerId: "p1"
    });

    expect(socket.emit).toHaveBeenCalledWith(
      "room:error",
      { message: "Game already started" }
    );
  });
});
EOF

cat > test/socket/matchmakingHandlers.test.js <<'EOF'
import { describe, expect, it, vi } from "vitest";
import GameManager from "../../src/managers/GameManager.js";
import { registerMatchmakingHandlers } from "../../src/socket/matchmakingHandlers.js";

const makeIo = () => ({ to: vi.fn(() => ({ emit: vi.fn() })) });

const makeSocket = () => {
  const handlers = {};
  return {
    handlers,
    socket: {
      id: "s1",
      data: {},
      on: vi.fn((event, cb) => { handlers[event] = cb; }),
      emit: vi.fn(),
      join: vi.fn(),
      leave: vi.fn()
    }
  };
};

describe("matchmakingHandlers", () => {
  it("rejects invalid player payload", () => {
    const { socket, handlers } = makeSocket();
    registerMatchmakingHandlers({
      io: makeIo(),
      socket,
      gameManager: new GameManager(),
      disconnectTimers: { cancel: vi.fn() }
    });

    handlers["matchmaking:join"]({
      player: null,
      playerId: "p1"
    });

    expect(socket.emit).toHaveBeenCalledWith(
      "matchmaking:error",
      { message: "Invalid player" }
    );
  });

  it("creates a waiting room when none exists", () => {
    const { socket, handlers } = makeSocket();
    const manager = new GameManager();

    registerMatchmakingHandlers({
      io: makeIo(),
      socket,
      gameManager: manager,
      disconnectTimers: { cancel: vi.fn() }
    });

    handlers["matchmaking:join"]({
      player: "Eric",
      playerId: "p1"
    });

    expect(manager.games.size).toBe(1);
    const game = [...manager.games.values()][0];
    expect(game.getPlayer("p1")).toBeTruthy();
    expect(socket.emit).toHaveBeenCalledWith(
      "matchmaking:found",
      { room: game.roomName }
    );
  });

  it("joins an existing available room", () => {
    const manager = new GameManager();
    const waiting = manager.createGame("waiting");
    const { socket, handlers } = makeSocket();

    registerMatchmakingHandlers({
      io: makeIo(),
      socket,
      gameManager: manager,
      disconnectTimers: { cancel: vi.fn() }
    });

    handlers["matchmaking:join"]({
      player: "Eric",
      playerId: "p1"
    });

    expect(waiting.getPlayer("p1")).toBeTruthy();
    expect(socket.join).toHaveBeenCalledWith("waiting");
  });
});
EOF

cat > test/socket/botHandlers.test.js <<'EOF'
import { describe, expect, it, vi } from "vitest";
import Game from "../../src/classes/Game.js";
import Player from "../../src/classes/Player.js";
import { registerBotHandlers } from "../../src/socket/botHandlers.js";

const makeSocket = () => {
  const handlers = {};
  return {
    handlers,
    socket: {
      id: "s1",
      on: vi.fn((event, cb) => { handlers[event] = cb; }),
      emit: vi.fn()
    }
  };
};

const makeIo = () => ({ to: vi.fn(() => ({ emit: vi.fn() })) });

describe("botHandlers", () => {
  it("lets host add a bot before game starts", () => {
    const game = new Game("alpha");
    game.addPlayer(new Player("p1", "s1", "Eric"));
    const manager = {
      games: new Map([["alpha", game]]),
      getGame: () => game
    };

    const { socket, handlers } = makeSocket();
    registerBotHandlers({
      io: makeIo(),
      socket,
      gameManager: manager
    });

    handlers["bot:add"]({ room: "alpha" });
    expect(game.getPlayers().some((p) => p.isBot)).toBe(true);
  });

  it("lets host remove a bot", () => {
    const game = new Game("alpha");
    game.addPlayer(new Player("p1", "s1", "Eric"));
    const bot = new Player("bot1", null, "Bot");
    bot.isBot = true;
    game.addPlayer(bot);

    const manager = {
      games: new Map([["alpha", game]]),
      getGame: () => game
    };

    const { socket, handlers } = makeSocket();
    registerBotHandlers({
      io: makeIo(),
      socket,
      gameManager: manager
    });

    handlers["bot:remove"]({
      room: "alpha",
      botId: "bot1"
    });

    expect(game.getPlayer("bot1")).toBeUndefined();
  });

  it("ignores bot changes during game", () => {
    const game = new Game("alpha");
    game.addPlayer(new Player("p1", "s1", "Eric"));
    game.started = true;

    const manager = {
      games: new Map([["alpha", game]]),
      getGame: () => game
    };

    const { socket, handlers } = makeSocket();
    registerBotHandlers({
      io: makeIo(),
      socket,
      gameManager: manager
    });

    handlers["bot:add"]({ room: "alpha" });
    expect(game.getPlayers()).toHaveLength(1);
  });
});
EOF

cat > test/socket/disconnectHandlers.test.js <<'EOF'
import { describe, expect, it, vi } from "vitest";
import Game from "../../src/classes/Game.js";
import Player from "../../src/classes/Player.js";
import { registerDisconnectHandlers } from "../../src/socket/disconnectHandlers.js";

describe("disconnectHandlers", () => {
  it("registers disconnect and schedules player removal", () => {
    const handlers = {};
    const socket = {
      id: "s1",
      data: {
        room: "alpha",
        playerId: "p1"
      },
      on: vi.fn((event, cb) => { handlers[event] = cb; })
    };

    const game = new Game("alpha");
    game.addPlayer(new Player("p1", "s1", "Eric"));

    const schedule = vi.fn();

    registerDisconnectHandlers({
      io: { to: vi.fn(() => ({ emit: vi.fn() })) },
      socket,
      gameManager: { getGame: () => game },
      disconnectTimers: { schedule }
    });

    handlers.disconnect();

    expect(schedule).toHaveBeenCalledWith(
      "alpha",
      "p1",
      3000,
      expect.any(Function)
    );
  });

  it("does nothing game-related without room metadata", () => {
    const handlers = {};
    const socket = {
      id: "s1",
      data: {},
      on: vi.fn((event, cb) => { handlers[event] = cb; })
    };
    const schedule = vi.fn();

    registerDisconnectHandlers({
      io: {},
      socket,
      gameManager: { getGame: vi.fn() },
      disconnectTimers: { schedule }
    });

    handlers.disconnect();
    expect(schedule).not.toHaveBeenCalled();
  });
});
EOF

cat > test/socket/connection.test.js <<'EOF'
import { describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  registerRoomHandlers: vi.fn(),
  registerMatchmakingHandlers: vi.fn(),
  registerGameHandlers: vi.fn(),
  registerPieceHandlers: vi.fn(),
  registerPenaltyHandlers: vi.fn(),
  registerSpectrumHandlers: vi.fn(),
  registerDisconnectHandlers: vi.fn(),
  registerBotHandlers: vi.fn()
}));

vi.mock("../../src/socket/roomHandlers.js", () => ({
  registerRoomHandlers: mocks.registerRoomHandlers
}));
vi.mock("../../src/socket/matchmakingHandlers.js", () => ({
  registerMatchmakingHandlers: mocks.registerMatchmakingHandlers
}));
vi.mock("../../src/socket/gameHandlers.js", () => ({
  registerGameHandlers: mocks.registerGameHandlers
}));
vi.mock("../../src/socket/pieceHandlers.js", () => ({
  registerPieceHandlers: mocks.registerPieceHandlers
}));
vi.mock("../../src/socket/penaltyHandlers.js", () => ({
  registerPenaltyHandlers: mocks.registerPenaltyHandlers
}));
vi.mock("../../src/socket/spectrumHandlers.js", () => ({
  registerSpectrumHandlers: mocks.registerSpectrumHandlers
}));
vi.mock("../../src/socket/disconnectHandlers.js", () => ({
  registerDisconnectHandlers: mocks.registerDisconnectHandlers
}));
vi.mock("../../src/socket/botHandlers.js", () => ({
  registerBotHandlers: mocks.registerBotHandlers
}));

import { registerSocketHandlers } from "../../src/socket/connection.js";

describe("connection", () => {
  it("registers all socket handler groups on connection", () => {
    let onConnection;
    const io = {
      on: vi.fn((event, cb) => {
        if (event === "connection") onConnection = cb;
      })
    };
    const gameManager = {};
    registerSocketHandlers({ io, gameManager });

    const socket = { id: "s1" };
    onConnection(socket);

    expect(mocks.registerRoomHandlers).toHaveBeenCalled();
    expect(mocks.registerMatchmakingHandlers).toHaveBeenCalled();
    expect(mocks.registerGameHandlers).toHaveBeenCalled();
    expect(mocks.registerPieceHandlers).toHaveBeenCalled();
    expect(mocks.registerPenaltyHandlers).toHaveBeenCalled();
    expect(mocks.registerSpectrumHandlers).toHaveBeenCalled();
    expect(mocks.registerBotHandlers).toHaveBeenCalled();
    expect(mocks.registerDisconnectHandlers).toHaveBeenCalled();
  });
});
EOF

cat > test/bots/botRunner.test.js <<'EOF'
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import Game from "../../src/classes/Game.js";
import Player from "../../src/classes/Player.js";
import BotPlayer from "../../src/bots/botPlayer.js";
import BotRunner from "../../src/bots/botRunner.js";
import Piece from "../../src/classes/Piece.js";

const makeIo = () => {
  const emit = vi.fn();
  return {
    emit,
    io: { to: vi.fn(() => ({ emit })) }
  };
};

describe("BotRunner", () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it("builds timer keys", () => {
    const { io } = makeIo();
    const runner = new BotRunner({ io });
    expect(runner.getTimerKey({ roomName: "r" }, { id: "b" })).toBe("r:b");
  });

  it("schedules bot turns", () => {
    const { io } = makeIo();
    const runner = new BotRunner({ io });
    const game = new Game("alpha");
    const bot = new BotPlayer({
      playerId: "bot1",
      name: "Bot",
      difficulty: "expert"
    });
    game.addPlayer(bot);
    game.started = true;

    const spy = vi.spyOn(runner, "playTurn").mockImplementation(() => {});
    runner.scheduleTurn(game, bot);
    vi.advanceTimersByTime(250);
    expect(spy).toHaveBeenCalledWith(game, bot);
  });

  it("does not schedule stopped or dead bots", () => {
    const { io } = makeIo();
    const runner = new BotRunner({ io });
    const game = new Game("alpha");
    const bot = new BotPlayer({
      playerId: "bot1",
      name: "Bot",
      difficulty: "easy"
    });

    runner.scheduleTurn(game, bot);
    expect(runner.timers.size).toBe(0);

    game.started = true;
    bot.alive = false;
    runner.scheduleTurn(game, bot);
    expect(runner.timers.size).toBe(0);
  });

  it("applies penalty and emits spectrum", () => {
    const { io, emit } = makeIo();
    const runner = new BotRunner({ io });
    const game = new Game("alpha");
    const bot = new BotPlayer({
      playerId: "bot1",
      name: "Bot",
      difficulty: "easy"
    });
    game.addPlayer(bot);
    game.started = true;

    runner.applyPenalty(game, bot, 2, "Eric");
    expect(bot.board.slice(-2).every((row) => row.every((c) => c === "P"))).toBe(true);
    expect(emit).toHaveBeenCalledWith(
      "spectrum:update",
      expect.objectContaining({ playerId: "bot1" })
    );
  });

  it("sends penalty to human targets", () => {
    const { io, emit } = makeIo();
    const runner = new BotRunner({ io });
    const game = new Game("alpha");
    const attacker = new BotPlayer({
      playerId: "bot1",
      name: "Bot",
      difficulty: "easy"
    });
    const human = new Player("p1", "s1", "Eric");
    game.addPlayer(human);
    game.addPlayer(attacker);
    game.started = true;

    runner.sendPenalty(game, attacker, 2);

    expect(emit).toHaveBeenCalledWith("penalty:add", {
      count: 2,
      from: "Bot"
    });
  });

  it("kills bot when sequence is exhausted", () => {
    const { io } = makeIo();
    const runner = new BotRunner({ io });
    const game = new Game("alpha");
    const bot = new BotPlayer({
      playerId: "bot1",
      name: "Bot",
      difficulty: "expert"
    });
    game.addPlayer(bot);
    game.started = true;
    game.activeMode = "solo";
    game.pieces = [];

    runner.playTurn(game, bot);
    expect(bot.alive).toBe(false);
  });

  it("starts only bot players", () => {
    const { io } = makeIo();
    const runner = new BotRunner({ io });
    const game = new Game("alpha");
    const human = new Player("p1", "s1", "Eric");
    const bot = new BotPlayer({
      playerId: "bot1",
      name: "Bot",
      difficulty: "expert"
    });
    game.addPlayer(human);
    game.addPlayer(bot);
    game.started = true;

    const spy = vi.spyOn(runner, "scheduleTurn").mockImplementation(() => {});
    runner.startGame(game);

    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy).toHaveBeenCalledWith(game, bot, true);
  });

  it("can play a normal turn", () => {
    const { io } = makeIo();
    const runner = new BotRunner({ io });
    const game = new Game("alpha");
    const human = new Player("p1", "s1", "Eric");
    const bot = new BotPlayer({
      playerId: "bot1",
      name: "Bot",
      difficulty: "expert"
    });
    game.addPlayer(human);
    game.addPlayer(bot);
    game.started = true;
    game.activeMode = "battle-royale";
    game.pieces = [new Piece("O")];

    vi.spyOn(runner, "scheduleTurn").mockImplementation(() => {});
    runner.playTurn(game, bot);

    expect(bot.pieceIndex).toBe(1);
    expect(bot.board.flat().some((c) => c === "O")).toBe(true);
  });
});
EOF

cat > test/app/app.test.js <<'EOF'
import { describe, expect, it } from "vitest";
import request from "supertest";
import app from "../../src/app.js";

describe("Express app", () => {
  it("returns health status", async () => {
    const response = await request(app).get("/health");
    expect(response.status).toBe(200);
    expect(response.body).toEqual({ status: "ok" });
  });

  it("exposes Prometheus metrics", async () => {
    const response = await request(app).get("/metrics");
    expect(response.status).toBe(200);
    expect(response.text).toContain("red_tetris_connected_sockets");
  });
});
EOF

cat > test/metrics/metrics.test.js <<'EOF'
import { describe, expect, it } from "vitest";
import {
  activeBots,
  activeRooms,
  connectedSockets,
  gameDuration,
  gamesFinished,
  gamesStarted,
  penaltiesSent,
  registry
} from "../../src/metrics/metrics.js";

describe("metrics", () => {
  it("exports Prometheus registry and custom metrics", () => {
    expect(registry).toBeTruthy();
    expect(connectedSockets).toBeTruthy();
    expect(activeRooms).toBeTruthy();
    expect(gamesStarted).toBeTruthy();
    expect(gamesFinished).toBeTruthy();
    expect(penaltiesSent).toBeTruthy();
    expect(activeBots).toBeTruthy();
    expect(gameDuration).toBeTruthy();
  });

  it("registry contains Red Tetris metrics", async () => {
    const text = await registry.metrics();
    expect(text).toContain("red_tetris_connected_sockets");
    expect(text).toContain("red_tetris_active_rooms");
    expect(text).toContain("red_tetris_games_started_total");
  });
});
EOF

echo
echo "=========================================="
echo "Tests serveur créés."
echo "=========================================="
echo
echo "Commande test:"
echo "  npm test"
echo
echo "Commande coverage:"
echo "  npm run coverage"
echo
echo "Pour limiter la RAM:"
echo '  NODE_OPTIONS="--max-old-space-size=4096" npx vitest run --coverage --maxWorkers=1'
