import { describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  registerRoomHandlers: vi.fn(),
  registerMatchmakingHandlers: vi.fn(),
  registerGameHandlers: vi.fn(),
  registerPieceHandlers: vi.fn(),
  registerPenaltyHandlers: vi.fn(),
  registerSpectrumHandlers: vi.fn(),
  registerDisconnectHandlers: vi.fn(),
  registerBotHandlers: vi.fn()
}));

vi.mock("../../src/socket/roomHandlers.js", () => ({
  registerRoomHandlers: mocks.registerRoomHandlers
}));
vi.mock("../../src/socket/matchmakingHandlers.js", () => ({
  registerMatchmakingHandlers: mocks.registerMatchmakingHandlers
}));
vi.mock("../../src/socket/gameHandlers.js", () => ({
  registerGameHandlers: mocks.registerGameHandlers
}));
vi.mock("../../src/socket/pieceHandlers.js", () => ({
  registerPieceHandlers: mocks.registerPieceHandlers
}));
vi.mock("../../src/socket/penaltyHandlers.js", () => ({
  registerPenaltyHandlers: mocks.registerPenaltyHandlers
}));
vi.mock("../../src/socket/spectrumHandlers.js", () => ({
  registerSpectrumHandlers: mocks.registerSpectrumHandlers
}));
vi.mock("../../src/socket/disconnectHandlers.js", () => ({
  registerDisconnectHandlers: mocks.registerDisconnectHandlers
}));
vi.mock("../../src/socket/botHandlers.js", () => ({
  registerBotHandlers: mocks.registerBotHandlers
}));

import { registerSocketHandlers } from "../../src/socket/connection.js";

describe("connection", () => {
  it("registers all socket handler groups on connection", () => {
    let onConnection;
    const io = {
      on: vi.fn((event, cb) => {
        if (event === "connection") onConnection = cb;
      })
    };
    const gameManager = {};
    registerSocketHandlers({ io, gameManager });

    const socket = { id: "s1" };
    onConnection(socket);

    expect(mocks.registerRoomHandlers).toHaveBeenCalled();
    expect(mocks.registerMatchmakingHandlers).toHaveBeenCalled();
    expect(mocks.registerGameHandlers).toHaveBeenCalled();
    expect(mocks.registerPieceHandlers).toHaveBeenCalled();
    expect(mocks.registerPenaltyHandlers).toHaveBeenCalled();
    expect(mocks.registerSpectrumHandlers).toHaveBeenCalled();
    expect(mocks.registerBotHandlers).toHaveBeenCalled();
    expect(mocks.registerDisconnectHandlers).toHaveBeenCalled();
  });
});
