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
