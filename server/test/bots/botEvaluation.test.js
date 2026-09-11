import { describe, expect, it } from "vitest";
import { evaluateBotBoard } from "../../src/bots/botEvaluation.js";

const emptyBoard = () => Array.from({ length: 20 }, () => Array(10).fill(null));

const weights = {
  lines: 10,
  holes: -5,
  height: -2,
  bumpiness: -1
};

describe("botEvaluation", () => {
  it("scores an empty board at zero", () => {
    expect(evaluateBotBoard({ board: emptyBoard(), clearedLines: 0, weights })).toBe(0);
  });

  it("rewards cleared lines", () => {
    expect(evaluateBotBoard({ board: emptyBoard(), clearedLines: 2, weights })).toBe(20);
  });

  it("penalizes height, holes and bumpiness", () => {
    const board = emptyBoard();
    board[17][0] = "I";
    board[19][0] = "I";
    board[19][1] = "I";
    expect(evaluateBotBoard({ board, clearedLines: 0, weights })).toBeLessThan(0);
  });
});
