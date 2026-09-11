import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createDisconnectTimers } from "../../src/services/disconnectTimers.js";

describe("disconnectTimers", () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it("runs scheduled callbacks", () => {
    const timers = createDisconnectTimers();
    const callback = vi.fn();
    timers.schedule("room", "p1", 1000, callback);
    vi.advanceTimersByTime(1000);
    expect(callback).toHaveBeenCalledOnce();
  });

  it("cancels timers", () => {
    const timers = createDisconnectTimers();
    const callback = vi.fn();
    timers.schedule("room", "p1", 1000, callback);
    timers.cancel("room", "p1");
    vi.advanceTimersByTime(1000);
    expect(callback).not.toHaveBeenCalled();
  });

  it("replaces an existing timer for the same player", () => {
    const timers = createDisconnectTimers();
    const first = vi.fn();
    const second = vi.fn();
    timers.schedule("room", "p1", 1000, first);
    timers.schedule("room", "p1", 1000, second);
    vi.advanceTimersByTime(1000);
    expect(first).not.toHaveBeenCalled();
    expect(second).toHaveBeenCalledOnce();
  });

  it("ignores cancel when no timer exists", () => {
    expect(() => createDisconnectTimers().cancel("room", "missing")).not.toThrow();
  });
});
