import { describe, expect, it } from "vitest";
import { BOT_DIFFICULTIES, getBotDifficulty } from "../../src/bots/botDifficulty.js";

describe("botDifficulty", () => {
  it("returns requested config", () => {
    expect(getBotDifficulty("hard")).toBe(BOT_DIFFICULTIES.hard);
  });

  it("falls back to medium", () => {
    expect(getBotDifficulty("unknown")).toBe(BOT_DIFFICULTIES.medium);
  });
});
