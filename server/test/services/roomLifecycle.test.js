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
