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
