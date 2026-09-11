import { describe, expect, it, vi } from "vitest";
import Game from "../../src/classes/Game.js";
import Player from "../../src/classes/Player.js";
import { registerBotHandlers } from "../../src/socket/botHandlers.js";

const makeSocket = () => {
  const handlers = {};
  return {
    handlers,
    socket: {
      id: "s1",
      on: vi.fn((event, cb) => { handlers[event] = cb; }),
      emit: vi.fn()
    }
  };
};

const makeIo = () => ({ to: vi.fn(() => ({ emit: vi.fn() })) });

describe("botHandlers", () => {
  it("lets host add a bot before game starts", () => {
    const game = new Game("alpha");
    game.addPlayer(new Player("p1", "s1", "Eric"));
    const manager = {
      games: new Map([["alpha", game]]),
      getGame: () => game
    };

    const { socket, handlers } = makeSocket();
    registerBotHandlers({
      io: makeIo(),
      socket,
      gameManager: manager
    });

    handlers["bot:add"]({ room: "alpha" });
    expect(game.getPlayers().some((p) => p.isBot)).toBe(true);
  });

  it("lets host remove a bot", () => {
    const game = new Game("alpha");
    game.addPlayer(new Player("p1", "s1", "Eric"));
    const bot = new Player("bot1", null, "Bot");
    bot.isBot = true;
    game.addPlayer(bot);

    const manager = {
      games: new Map([["alpha", game]]),
      getGame: () => game
    };

    const { socket, handlers } = makeSocket();
    registerBotHandlers({
      io: makeIo(),
      socket,
      gameManager: manager
    });

    handlers["bot:remove"]({
      room: "alpha",
      botId: "bot1"
    });

    expect(game.getPlayer("bot1")).toBeUndefined();
  });

  it("ignores bot changes during game", () => {
    const game = new Game("alpha");
    game.addPlayer(new Player("p1", "s1", "Eric"));
    game.started = true;

    const manager = {
      games: new Map([["alpha", game]]),
      getGame: () => game
    };

    const { socket, handlers } = makeSocket();
    registerBotHandlers({
      io: makeIo(),
      socket,
      gameManager: manager
    });

    handlers["bot:add"]({ room: "alpha" });
    expect(game.getPlayers()).toHaveLength(1);
  });
});
