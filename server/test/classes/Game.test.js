import { describe, expect, it, vi } from "vitest";
import Game from "../../src/classes/Game.js";
import Player from "../../src/classes/Player.js";
import Piece from "../../src/classes/Piece.js";

const makePlayer = (id, socketId = `s-${id}`, name = id) =>
  new Player(id, socketId, name);

describe("Game", () => {
  it("initializes room state", () => {
    const game = new Game("room");
    expect(game.roomName).toBe("room");
    expect(game.players.size).toBe(0);
    expect(game.hostId).toBeNull();
    expect(game.started).toBe(false);
    expect(game.roundId).toBe(0);
    expect(game.mode).toBe("battle-royale");
    expect(game.activeMode).toBeNull();
  });

  it("assigns first human as host", () => {
    const game = new Game("room");
    const p = makePlayer("p1");
    game.addPlayer(p);
    expect(game.hostId).toBe("p1");
    expect(p.isHost).toBe(true);
  });

  it("never assigns host role to a bot", () => {
    const game = new Game("room");
    const bot = makePlayer("bot");
    bot.isBot = true;
    game.addPlayer(bot);
    expect(game.hostId).toBeNull();
    expect(bot.isHost).toBe(false);
  });

  it("reconnects an existing player", () => {
    const game = new Game("room");
    const old = makePlayer("p1", "old", "Old");
    game.addPlayer(old);
    const result = game.addPlayer(makePlayer("p1", "new", "New"));
    expect(result).toBe(old);
    expect(game.players.size).toBe(1);
    expect(old.socketId).toBe("new");
    expect(old.name).toBe("New");
  });

  it("transfers host to next human", () => {
    const game = new Game("room");
    const p1 = makePlayer("p1");
    const bot = makePlayer("bot");
    bot.isBot = true;
    const p2 = makePlayer("p2");
    game.addPlayer(p1);
    game.addPlayer(bot);
    game.addPlayer(p2);
    game.removePlayer("p1");
    expect(game.hostId).toBe("p2");
    expect(p2.isHost).toBe(true);
  });

  it("clears host if only bots remain", () => {
    const game = new Game("room");
    const p1 = makePlayer("p1");
    const bot = makePlayer("bot");
    bot.isBot = true;
    game.addPlayer(p1);
    game.addPlayer(bot);
    game.removePlayer("p1");
    expect(game.hostId).toBeNull();
  });

  it("ignores removal of unknown players", () => {
    const game = new Game("room");
    expect(() => game.removePlayer("missing")).not.toThrow();
  });

  it("finds players by socket", () => {
    const game = new Game("room");
    const p = makePlayer("p1", "special");
    game.addPlayer(p);
    expect(game.findPlayerBySocket("special")).toBe(p);
    expect(game.findPlayerBySocket("none")).toBeNull();
  });

  it("returns players as an array", () => {
    const game = new Game("room");
    game.addPlayer(makePlayer("p1"));
    game.addPlayer(makePlayer("p2"));
    expect(game.getPlayers()).toHaveLength(2);
  });

  it("accepts only supported modes", () => {
    const game = new Game("room");
    expect(game.setMode("points")).toBe(true);
    expect(game.mode).toBe("points");
    expect(game.setMode("battle-royale")).toBe(true);
    expect(game.setMode("invalid")).toBe(false);
  });

  it("creates immutable-style ranking snapshots", () => {
    const game = new Game("room");
    const p = makePlayer("p1", "s1", "Eric");
    p.score = 123;
    p.isBot = true;
    expect(game.createPlayerSnapshot(p)).toEqual({
      id: "p1",
      name: "Eric",
      score: 123,
      isBot: true
    });
  });

  it("marks players dead once", () => {
    const game = new Game("room");
    const p = makePlayer("p1");
    game.addPlayer(p);
    game.markPlayerDead("p1");
    game.markPlayerDead("p1");
    game.markPlayerDead("missing");
    expect(p.alive).toBe(false);
    expect(game.eliminationOrder).toHaveLength(1);
  });

  it("records departed players once", () => {
    const game = new Game("room");
    const p = makePlayer("p1");
    game.recordDepartedPlayer(p);
    game.recordDepartedPlayer(p);
    expect(game.departedPlayers).toHaveLength(1);
  });

  it("returns alive players and finished state", () => {
    const game = new Game("room");
    const p1 = makePlayer("p1");
    const p2 = makePlayer("p2");
    game.addPlayer(p1);
    game.addPlayer(p2);
    p1.alive = false;
    expect(game.getAlivePlayers()).toEqual([p2]);
    expect(game.isFinished()).toBe(false);
    p2.alive = false;
    expect(game.isFinished()).toBe(true);
  });

  it("reverses elimination order for Battle Royale ranking", () => {
    const game = new Game("room");
    const p1 = makePlayer("p1");
    const p2 = makePlayer("p2");
    game.addPlayer(p1);
    game.addPlayer(p2);
    game.markPlayerDead("p1");
    game.markPlayerDead("p2");
    expect(game.getRanking().map((p) => p.id)).toEqual(["p2", "p1"]);
  });

  it("sorts points ranking and removes duplicate ids", () => {
    const game = new Game("room");
    const p1 = makePlayer("p1");
    const p2 = makePlayer("p2");
    p1.score = 100;
    p2.score = 500;
    game.addPlayer(p1);
    game.addPlayer(p2);
    game.departedPlayers.push({ id: "p1", name: "old", score: 20 });
    expect(game.getPointsRanking().map((p) => p.id)).toEqual(["p2", "p1"]);
  });

  it("generates a shared sequence", () => {
    const game = new Game("room");
    const spy = vi.spyOn(game, "generateBag").mockReturnValue([new Piece("I")]);
    game.generateSequence(3);
    expect(spy).toHaveBeenCalledTimes(3);
    expect(game.pieces).toHaveLength(3);
  });

  it("uses independent indices over the same shared sequence", () => {
    const game = new Game("room");
    game.pieces = [new Piece("I"), new Piece("T")];
    const p1 = makePlayer("p1");
    const p2 = makePlayer("p2");

    expect(game.peekNextPiece(p1)).toBe("I");
    expect(game.getNextPiece(p1)).toBe("I");
    expect(game.getNextPiece(p2)).toBe("I");
    expect(game.getNextPiece(p1)).toBe("T");
    expect(game.getNextPiece(p1)).toBeNull();
    expect(game.peekNextPiece(p1)).toBeNull();
  });
});
