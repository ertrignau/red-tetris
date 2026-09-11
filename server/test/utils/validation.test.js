import { describe, expect, it } from "vitest";
import {
  validatePlayerId,
  validateRoom,
  validateUsername
} from "../../src/utils/validation.js";

describe("validation", () => {
  it("validates usernames", () => {
    expect(validateUsername(null)).toBe("Invalid username");
    expect(validateUsername("ab")).toMatch(/between 3 and 16/);
    expect(validateUsername("x".repeat(17))).toMatch(/between 3 and 16/);
    expect(validateUsername("Eric")).toBeNull();
  });

  it("validates room names", () => {
    expect(validateRoom(null)).toBe("Invalid room");
    expect(validateRoom("ab")).toMatch(/between 3 and 20/);
    expect(validateRoom("x".repeat(21))).toMatch(/between 3 and 20/);
    expect(validateRoom("bad room!")).toMatch(/only contain/);
    expect(validateRoom("room_42-test")).toBeNull();
  });

  it("validates player ids", () => {
    expect(validatePlayerId(null)).toBe("Invalid player id");
    expect(validatePlayerId("")).toBe("Invalid player id");
    expect(validatePlayerId("x".repeat(129))).toBe("Invalid player id");
    expect(validatePlayerId("player-id")).toBeNull();
  });
});
