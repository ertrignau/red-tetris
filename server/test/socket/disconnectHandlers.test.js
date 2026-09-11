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
