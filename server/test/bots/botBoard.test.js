import { describe, expect, it } from "vitest";
import {
  BOT_BOARD_HEIGHT,
  BOT_BOARD_WIDTH,
  addBotPenaltyLines,
  calculateBotSpectrum,
  clearBotLines,
  cloneBotBoard,
  createBotBoard,
  hasBotCollision,
  lockBotPiece
} from "../../src/bots/botBoard.js";

describe("botBoard", () => {
  it("creates an empty 10x20 board", () => {
    const board = createBotBoard();
    expect(board).toHaveLength(BOT_BOARD_HEIGHT);
    expect(board[0]).toHaveLength(BOT_BOARD_WIDTH);
    expect(board.flat().every((c) => c === null)).toBe(true);
  });

  it("clones without sharing rows", () => {
    const board = createBotBoard();
    const copy = cloneBotBoard(board);
    copy[0][0] = "I";
    expect(board[0][0]).toBeNull();
  });

  it("detects walls, floor and occupied cells", () => {
    const board = createBotBoard();
    expect(hasBotCollision(board, [[1]], 0, 0)).toBe(false);
    expect(hasBotCollision(board, [[1]], -1, 0)).toBe(true);
    expect(hasBotCollision(board, [[1]], 10, 0)).toBe(true);
    expect(hasBotCollision(board, [[1]], 0, 20)).toBe(true);
    board[5][5] = "T";
    expect(hasBotCollision(board, [[1]], 5, 5)).toBe(true);
  });

  it("ignores empty shape cells", () => {
    const board = createBotBoard();
    expect(hasBotCollision(board, [[0, 1]], -1, 0)).toBe(false);
  });

  it("locks pieces immutably", () => {
    const board = createBotBoard();
    const next = lockBotPiece(board, [[1, 1], [1, 1]], "O", 4, 18);
    expect(board[18][4]).toBeNull();
    expect(next[18][4]).toBe("O");
    expect(next[19][5]).toBe("O");
  });

  it("clears normal full lines", () => {
    const board = createBotBoard();
    board[19] = Array(10).fill("I");
    const result = clearBotLines(board);
    expect(result.clearedLines).toBe(1);
    expect(result.board[0]).toEqual(Array(10).fill(null));
  });

  it("keeps indestructible penalty rows", () => {
    const board = createBotBoard();
    board[19] = Array(10).fill("P");
    expect(clearBotLines(board).clearedLines).toBe(0);
  });

  it("sanitizes and adds penalty lines", () => {
    const board = createBotBoard();
    expect(addBotPenaltyLines(board, 0)).toBe(board);
    const result = addBotPenaltyLines(board, 2.9);
    expect(result.slice(-2)).toEqual([
      Array(10).fill("P"),
      Array(10).fill("P")
    ]);
  });

  it("clamps penalty count", () => {
    const board = addBotPenaltyLines(createBotBoard(), 999);
    expect(board.every((row) => row.every((c) => c === "P"))).toBe(true);
  });

  it("calculates spectrum heights", () => {
    const board = createBotBoard();
    board[19][0] = "I";
    board[10][1] = "T";
    const spectrum = calculateBotSpectrum(board);
    expect(spectrum[0]).toBe(1);
    expect(spectrum[1]).toBe(10);
    expect(spectrum[2]).toBe(0);
  });
});
