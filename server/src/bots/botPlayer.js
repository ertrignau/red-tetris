import Player
	from "../classes/Player.js";

import {
	createBotBoard
} from "./botBoard.js";

class BotPlayer extends Player {
	constructor({
		playerId,
		name,
		difficulty
	}) {
		super(
			playerId,
			null,
			name
		);

		this.isBot =
			true;

		this.difficulty =
			difficulty;

		this.board =
			createBotBoard();
	}

	resetBot() {
		this.alive =
			true;

		this.pieceIndex =
			0;

		this.spectrum =
			[];

		this.score =
			0;

		this.board =
			createBotBoard();
	}
}

export default BotPlayer;