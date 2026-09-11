import { afterEach, describe, expect, it, vi } from "vitest";
import { generateMatchmakingRoom } from "../../src/utils/roomName.js";

describe("roomName", () => {
  afterEach(() => vi.restoreAllMocks());

  it("generates a match-* room", () => {
    expect(generateMatchmakingRoom()).toMatch(/^match-/);
  });

  it("uses Math.random", () => {
    vi.spyOn(Math, "random").mockReturnValue(0.5);
    expect(generateMatchmakingRoom()).toMatch(/^match-/);
  });
});
