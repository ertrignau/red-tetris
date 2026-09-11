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
