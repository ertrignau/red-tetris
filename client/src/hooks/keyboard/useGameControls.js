import useMovementKeys
	from "./useMovementKeys.js";

import useRotationKey
	from "./useRotationKey.js";

import useDropKeys
	from "./useDropKey.js";

function useGameControls({
	started,
	gameOver,
	currentPiece,
	board,
	setCurrentPiece,
	onHardDrop
}) {
	const enabled =
		Boolean(
			started &&
			currentPiece &&
			!gameOver
		);

	useMovementKeys({
		enabled,
		board,
		setCurrentPiece
	});

	useRotationKey({
		enabled,
		board,
		setCurrentPiece
	});

	useDropKeys({
		enabled,
		onHardDrop
	});
}

export default useGameControls;