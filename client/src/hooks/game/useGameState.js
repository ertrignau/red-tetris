import {
	useCallback,
	useState
} from "react";

import {
	createBoard
} from "../../game/board.js";

function useGameState() {
	const [
		board,
		setBoard
	] = useState(
		() => createBoard()
	);

	const [
		score,
		setScore
	] = useState(0);

	const [
		gameOver,
		setGameOver
	] = useState(false);

	const resetGameState =
		useCallback(
			() => {
				setBoard(
					createBoard()
				);

				setScore(
					0
				);

				setGameOver(
					false
				);
			},
			[]
		);

	return {
		board,
		setBoard,

		score,
		setScore,

		gameOver,
		setGameOver,

		resetGameState
	};
}

export default useGameState;