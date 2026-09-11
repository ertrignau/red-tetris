import { describe, expect, it } from "vitest";
import GameManager from "../../src/managers/GameManager.js";
import Player from "../../src/classes/Player.js";
import { MAX_PLAYERS } from "../../../shared/constants.js";

describe("GameManager", () => {
  it("creates, gets and removes games", () => {
    const manager = new GameManager();
    const game = manager.createGame("alpha");
    expect(manager.getGame("alpha")).toBe(game);
    expect(manager.hasGame("alpha")).toBe(true);
    manager.removeGame("alpha");
    expect(manager.hasGame("alpha")).toBe(false);
  });

  it("reuses existing games", () => {
    const manager = new GameManager();
    expect(manager.getOrCreateGame("alpha")).toBe(manager.getOrCreateGame("alpha"));
    expect(manager.games.size).toBe(1);
  });

  it("finds a game by socket", () => {
    const manager = new GameManager();
    const game = manager.createGame("alpha");
    game.addPlayer(new Player("p1", "s1", "Eric"));
    expect(manager.findGameBySocket("s1")).toBe(game);
    expect(manager.findGameBySocket("missing")).toBeNull();
  });

  it("finds an available matchmaking room", () => {
    const manager = new GameManager();
    const started = manager.createGame("started");
    started.started = true;
    const available = manager.createGame("available");
    expect(manager.findAvailableGame()).toBe(available);
  });

  it("skips full rooms", () => {
    const manager = new GameManager();
    const game = manager.createGame("full");
    for (let i = 0; i < MAX_PLAYERS; i++) {
      game.addPlayer(new Player(`p${i}`, `s${i}`, `P${i}`));
    }
    expect(manager.findAvailableGame()).toBeNull();
  });
});
