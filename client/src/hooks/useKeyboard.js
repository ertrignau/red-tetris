import {
	useEffect
} from "react";

import {
	moveLeft,
	moveRight,
	moveDown
} from "../game/movement.js";

import {
	rotatePiece
} from "../game/rotation.js";

function useKeyboard({
	started,
	gameOver,
	board,
	currentPiece,
	setCurrentPiece,
	onHardDrop
}) {
	useEffect(() => {
		if (
			!started ||
			!currentPiece ||
			gameOver
		) {
			return;
		}

		const handleKeyDown =
			(event) => {
				/*
				 * Rotation and hard drop
				 * happen only once per
				 * physical key press.
				 */
				if (
					event.repeat &&
					(
						event.code ===
							"ArrowUp" ||
						event.code ===
							"Space"
					)
				) {
					event.preventDefault();

					return;
				}

				switch (
					event.code
				) {
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

						if (
							onHardDrop
						) {
							onHardDrop();
						}

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
		setCurrentPiece,
		onHardDrop
	]);
}

export default useKeyboard;