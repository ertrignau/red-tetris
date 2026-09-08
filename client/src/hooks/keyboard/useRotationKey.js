import {
	useEffect
} from "react";

import {
	rotatePiece
} from "../../game/rotation.js";

function useRotationKey({
	enabled,
	board,
	setCurrentPiece
}) {
	useEffect(() => {
		if (!enabled)
			return;

		const handleKeyDown =
			(event) => {
				if (
					event.code !==
					"ArrowUp"
				) {
					return;
				}

				event.preventDefault();

				if (
					event.repeat
				) {
					return;
				}

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

export default useRotationKey;