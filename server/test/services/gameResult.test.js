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
