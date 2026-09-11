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
