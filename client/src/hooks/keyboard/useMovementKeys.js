import {
	useEffect
} from "react";

import {
	moveLeft,
	moveRight,
	moveDown
} from "../../game/movement.js";

function useMovementKeys({
	enabled,
	board,
	setCurrentPiece
}) {
	useEffect(() => {
		if (!enabled)
			return;

		const handleKeyDown =
			(event) => {
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
		enabled,
		board,
		setCurrentPiece
	]);
}

export default useMovementKeys;