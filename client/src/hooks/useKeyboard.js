import { useEffect } from "react";

import {
	moveLeft,
	moveRight,
	moveDown
} from "../game/movement.js";

import { rotatePiece } from "../game/rotation.js";
import { hardDrop } from "../game/drop.js";

function useKeyboard({
	started,
	gameOver,
	board,
	currentPiece,
	setCurrentPiece
}) {
	useEffect(() => {
		if (
			!started ||
			!currentPiece ||
			gameOver
		) {
			return;
		}

		const handleKeyDown = (event) => {
			/*
			 * Rotation and hard drop must happen
			 * only once per physical key press.
			 *
			 * Holding the key would otherwise
			 * continuously reset the game loop.
			 */
			if (
				event.repeat &&
				(
					event.code === "ArrowUp" ||
					event.code === "Space"
				)
			) {
				event.preventDefault();
				return;
			}

			switch (event.code) {
				case "ArrowLeft":
					event.preventDefault();

					setCurrentPiece(
						(piece) => {
							if (!piece)
								return piece;

							return moveLeft(
								board,
								piece
							);
						}
					);

					break;

				case "ArrowRight":
					event.preventDefault();

					setCurrentPiece(
						(piece) => {
							if (!piece)
								return piece;

							return moveRight(
								board,
								piece
							);
						}
					);

					break;

				case "ArrowDown":
					event.preventDefault();

					setCurrentPiece(
						(piece) => {
							if (!piece)
								return piece;

							return moveDown(
								board,
								piece
							);
						}
					);

					break;

				case "ArrowUp":
					event.preventDefault();

					setCurrentPiece(
						(piece) => {
							if (!piece)
								return piece;

							return rotatePiece(
								board,
								piece
							);
						}
					);

					break;

				case "Space":
					event.preventDefault();

					setCurrentPiece(
						(piece) => {
							if (!piece)
								return piece;

							return hardDrop(
								board,
								piece
							);
						}
					);

					break;

				default:
					break;
			}
		};

		window.addEventListener(
			"keydown",
			handleKeyDown
		);

		return () => {
			window.removeEventListener(
				"keydown",
				handleKeyDown
			);
		};
	}, [
		started,
		gameOver,
		board,
		currentPiece,
		setCurrentPiece
	]);
}

export default useKeyboard;