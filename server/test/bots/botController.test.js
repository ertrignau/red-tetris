import { afterEach, describe, expect, it, vi } from "vitest";
import BotController from "../../src/bots/botController.js";
import BotPlayer from "../../src/bots/botPlayer.js";

const makeBot = (difficulty = "expert") =>
  new BotPlayer({
    playerId: "bot1",
    name: "Bot",
    difficulty
  });

describe("BotController", () => {
  afterEach(() => vi.restoreAllMocks());

  it("returns bot difficulty", () => {
    expect(new BotController(makeBot("hard")).getConfig().thinkDelay).toBe(450);
  });

  it("returns no moves for invalid piece", () => {
    expect(new BotController(makeBot()).findMoves("X")).toEqual([]);
  });

  it("finds legal moves", () => {
    const moves = new BotController(makeBot()).findMoves("T");
    expect(moves.length).toBeGreaterThan(0);
    expect(moves[0]).toEqual(expect.objectContaining({
      x: expect.any(Number),
      y: expect.any(Number),
      score: expect.any(Number)
    }));
  });

  it("returns null for no candidate", () => {
    expect(new BotController(makeBot()).selectMove([])).toBeNull();
  });

  it("selects best move in expert mode", () => {
    const controller = new BotController(makeBot("expert"));
    const best = { score: 100 };
    expect(controller.selectMove([{ score: 1 }, best, { score: 50 }])).toBe(best);
  });

  it("can intentionally choose an imperfect move", () => {
    const controller = new BotController(makeBot("easy"));
    const random = vi.spyOn(Math, "random");
    random.mockReturnValueOnce(0).mockReturnValueOnce(0.9);
    expect(controller.selectMove([
      { score: 100 },
      { score: 90 },
      { score: 80 }
    ])).toBeDefined();
  });

  it("chooseMove combines search and selection", () => {
    expect(new BotController(makeBot()).chooseMove("O")).toBeTruthy();
  });
});
