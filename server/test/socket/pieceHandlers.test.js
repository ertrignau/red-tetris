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
