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
