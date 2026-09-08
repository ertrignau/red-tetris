import {
	useCallback,
	useEffect,
	useState
} from "react";

function useCountdown(
	roomState
) {
	const [
		countdown,
		setCountdown
	] = useState(null);

	const [
		gamePlayable,
		setGamePlayable
	] = useState(false);

	const resetCountdown =
		useCallback(
			() => {
				setCountdown(
					null
				);

				setGamePlayable(
					false
				);
			},
			[]
		);

	useEffect(() => {
		if (
			!roomState?.started ||
			!roomState?.countdownEndsAt
		) {
			resetCountdown();

			return;
		}

		let goTimeout =
			null;

		const updateCountdown =
			() => {
				const remaining =
					roomState.countdownEndsAt -
					Date.now();

				if (
					remaining <= 0
				) {
					setCountdown(
						"GO"
					);

					setGamePlayable(
						true
					);

					goTimeout =
						setTimeout(
							() => {
								setCountdown(
									null
								);
							},
							500
						);

					return true;
				}

				setCountdown(
					Math.ceil(
						remaining /
							1000
					)
				);

				setGamePlayable(
					false
				);

				return false;
			};

		const finished =
			updateCountdown();

		if (finished) {
			return () => {
				if (
					goTimeout
				) {
					clearTimeout(
						goTimeout
					);
				}
			};
		}

		const interval =
			setInterval(
				() => {
					if (
						updateCountdown()
					) {
						clearInterval(
							interval
						);
					}
				},
				100
			);

		return () => {
			clearInterval(
				interval
			);

			if (
				goTimeout
			) {
				clearTimeout(
					goTimeout
				);
			}
		};
	}, [
		roomState?.started,
		roomState?.countdownEndsAt,
		resetCountdown
	]);

	return {
		countdown,
		gamePlayable,
		setGamePlayable,
		resetCountdown
	};
}

export default useCountdown;