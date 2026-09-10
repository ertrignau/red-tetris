import {
	useCallback,
	useEffect,
	useState
} from "react";

import socket from "../../socket/socket.js";

function useRanking({
	onGameFinished
}) {
	const [
		showRanking,
		setShowRanking
	] = useState(false);

	const [
		isFading,
		setIsFading
	] = useState(false);

	const [
		isFinishing,
		setIsFinishing
	] = useState(false);

	const [
		ranking,
		setRanking
	] = useState([]);

	const [
		finishedMode,
		setFinishedMode
	] = useState(null);

	const resetRanking =
		useCallback(
			() => {
				setShowRanking(
					false
				);

				setIsFading(
					false
				);

				setIsFinishing(
					false
				);

				setRanking(
					[]
				);

				setFinishedMode(
					null
				);
			},
			[]
		);

	useEffect(() => {
		let fadeTimeout =
			null;

		let rankingTimeout =
			null;

		const handleGameFinished =
			(data) => {
				console.log(
					"FINAL RANKING:",
					data.ranking
				);

				console.log(
					"FINISHED MODE:",
					data.mode
				);

				setRanking(
					data.ranking ??
						[]
				);

				setFinishedMode(
					data.mode ??
						null
				);

				if (
					onGameFinished
				) {
					onGameFinished(
						data
					);
				}

				/*
				 * Solo keeps the final
				 * board visible and does
				 * not display ranking.
				 */
				if (
					data.mode ===
					"solo"
				) {
					setIsFinishing(
						false
					);

					setIsFading(
						false
					);

					setShowRanking(
						false
					);

					return;
				}

				setIsFinishing(
					true
				);

				fadeTimeout =
					setTimeout(
						() => {
							setIsFading(
								true
							);
						},
						600
					);

				rankingTimeout =
					setTimeout(
						() => {
							setShowRanking(
								true
							);

							setIsFading(
								false
							);

							setIsFinishing(
								false
							);
						},
						1000
					);
			};

		socket.on(
			"game:finished",
			handleGameFinished
		);

		return () => {
			socket.off(
				"game:finished",
				handleGameFinished
			);

			if (
				fadeTimeout
			) {
				clearTimeout(
					fadeTimeout
				);
			}

			if (
				rankingTimeout
			) {
				clearTimeout(
					rankingTimeout
				);
			}
		};
	}, [
		onGameFinished
	]);

	return {
		showRanking,
		isFading,
		isFinishing,
		ranking,
		finishedMode,
		resetRanking
	};
}

export default useRanking;