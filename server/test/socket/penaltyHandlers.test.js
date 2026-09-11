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
