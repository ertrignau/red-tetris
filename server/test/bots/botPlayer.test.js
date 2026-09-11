import { describe, expect, it } from "vitest";
import BotPlayer from "../../src/bots/botPlayer.js";
import Player from "../../src/classes/Player.js";

describe("BotPlayer", () => {
  it("extends Player and owns a board", () => {
    const bot = new BotPlayer({
      playerId: "bot1",
      name: "Bot",
      difficulty: "hard"
    });

    expect(bot instanceof Player).toBe(true);
    expect(bot.isBot).toBe(true);
    expect(bot.socketId).toBeNull();
    expect(bot.difficulty).toBe("hard");
    expect(bot.board).toHaveLength(20);
  });

  it("resets bot state", () => {
    const bot = new BotPlayer({
      playerId: "bot1",
      name: "Bot",
      difficulty: "easy"
    });

    bot.alive = false;
    bot.pieceIndex = 8;
    bot.spectrum = [5];
    bot.score = 900;
    bot.board[0][0] = "I";

    bot.resetBot();

    expect(bot.alive).toBe(true);
    expect(bot.pieceIndex).toBe(0);
    expect(bot.spectrum).toEqual([]);
    expect(bot.score).toBe(0);
    expect(bot.board[0][0]).toBeNull();
  });
});
