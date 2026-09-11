import { describe, expect, it, vi } from "vitest";
import Game from "../../src/classes/Game.js";
import Player from "../../src/classes/Player.js";
import { buildRoomState, emitRoomState } from "../../src/services/roomState.js";

describe("roomState", () => {
  it("builds solo lobby state", () => {
    const game = new Game("alpha");
    game.addPlayer(new Player("p1", "s1", "Eric"));
    const state = buildRoomState(game);
    expect(state).toEqual(expect.objectContaining({
      room: "alpha",
      started: false,
      hostId: "p1",
      mode: "solo"
    }));
    expect(state.players[0]).toEqual(expect.objectContaining({
      playerId: "p1",
      name: "Eric",
      isHost: true,
      isBot: false,
      alive: true,
      score: 0
    }));
  });

  it("uses configured mode in multiplayer lobby", () => {
    const game = new Game("alpha");
    game.addPlayer(new Player("p1", "s1", "A"));
    game.addPlayer(new Player("p2", "s2", "B"));
    game.mode = "points";
    expect(buildRoomState(game).mode).toBe("points");
  });

  it("uses active mode while started", () => {
    const game = new Game("alpha");
    game.started = true;
    game.activeMode = "battle-royale";
    expect(buildRoomState(game).mode).toBe("battle-royale");
  });

  it("emits state to the room", () => {
    const game = new Game("alpha");
    const emit = vi.fn();
    const io = { to: vi.fn(() => ({ emit })) };
    emitRoomState(io, game);
    expect(io.to).toHaveBeenCalledWith("alpha");
    expect(emit).toHaveBeenCalledWith(
      "room:state",
      expect.objectContaining({ room: "alpha" })
    );
  });
});
