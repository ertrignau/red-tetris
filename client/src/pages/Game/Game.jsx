import {
	useParams
} from "react-router-dom";

import useGameController
	from "../../hooks/game/useGameController.js";

import GameView
	from "../../components/GameView/GameView.jsx";

function Game() {
	const {
		room,
		player
	} = useParams();

	const game =
		useGameController(
			room,
			player
		);

	return (
		<GameView
			room={
				room
			}

			player={
				player
			}

			game={
				game
			}
		/>
	);
}

export default Game;