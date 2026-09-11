import { afterEach, describe, expect, it, vi } from "vitest";
import Piece from "../../src/classes/Piece.js";

describe("Piece", () => {
  afterEach(() => vi.restoreAllMocks());

  it("contains the 7 Tetrimino types", () => {
    expect(Piece.TYPES).toEqual(["I", "O", "T", "S", "Z", "J", "L"]);
  });

  it("creates valid pieces", () => {
    expect(new Piece("T").type).toBe("T");
    expect(Piece.isValidType("I")).toBe(true);
  });

  it("rejects invalid pieces", () => {
    expect(Piece.isValidType("X")).toBe(false);
    expect(() => new Piece("X")).toThrow("Invalid piece type: X");
  });

  it("generates a complete 7-bag", () => {
    const bag = Piece.generateBag();
    expect(bag).toHaveLength(7);
    expect(bag.map((p) => p.type).sort()).toEqual([...Piece.TYPES].sort());
  });

  it("keeps every piece when shuffling", () => {
    vi.spyOn(Math, "random").mockReturnValue(0);
    const bag = Piece.generateBag();
    expect(new Set(bag.map((p) => p.type)).size).toBe(7);
  });
});
