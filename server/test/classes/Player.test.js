import { describe, expect, it } from "vitest";
import Player from "../../src/classes/Player.js";

describe("Player", () => {
  it("initializes player state", () => {
    const p = new Player("p1", "s1", "Eric");
    expect(p).toMatchObject({
      id: "p1",
      socketId: "s1",
      name: "Eric",
      alive: true,
      pieceIndex: 0,
      spectrum: [],
      score: 0,
      isHost: false
    });
  });

  it("reconnects with a new socket", () => {
    const p = new Player("p1", "s1", "Eric");
    p.reconnect("s2");
    expect(p.socketId).toBe("s2");
  });
});
