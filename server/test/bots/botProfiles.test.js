import { afterEach, describe, expect, it, vi } from "vitest";
import { BOT_PROFILES, getRandomBotProfile } from "../../src/bots/botProfiles.js";

describe("botProfiles", () => {
  afterEach(() => vi.restoreAllMocks());

  it("contains usable profiles", () => {
    expect(BOT_PROFILES.length).toBeGreaterThan(0);
    expect(BOT_PROFILES.every((p) => p.name && p.difficulty)).toBe(true);
  });

  it("returns a profile using Math.random", () => {
    vi.spyOn(Math, "random").mockReturnValue(0);
    expect(getRandomBotProfile()).toBe(BOT_PROFILES[0]);
  });
});
