import { describe, expect, it } from "vitest";
import {
  activeBots,
  activeRooms,
  connectedSockets,
  gameDuration,
  gamesFinished,
  gamesStarted,
  penaltiesSent,
  registry
} from "../../src/metrics/metrics.js";

describe("metrics", () => {
  it("exports Prometheus registry and custom metrics", () => {
    expect(registry).toBeTruthy();
    expect(connectedSockets).toBeTruthy();
    expect(activeRooms).toBeTruthy();
    expect(gamesStarted).toBeTruthy();
    expect(gamesFinished).toBeTruthy();
    expect(penaltiesSent).toBeTruthy();
    expect(activeBots).toBeTruthy();
    expect(gameDuration).toBeTruthy();
  });

  it("registry contains Red Tetris metrics", async () => {
    const text = await registry.metrics();
    expect(text).toContain("red_tetris_connected_sockets");
    expect(text).toContain("red_tetris_active_rooms");
    expect(text).toContain("red_tetris_games_started_total");
  });
});
