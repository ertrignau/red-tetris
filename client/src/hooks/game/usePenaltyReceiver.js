import {
	useEffect
} from "react";

import socket from "../../socket/socket.js";

function usePenaltyReceiver(
	applyPenalty
) {
	useEffect(() => {
		const onPenaltyAdd =
			({
				count,
				from
			}) => {
				console.log(
					`Penalty received from ${from}:`,
					count
				);

				applyPenalty(
					count
				);
			};

		socket.on(
			"penalty:add",
			onPenaltyAdd
		);

		return () => {
			socket.off(
				"penalty:add",
				onPenaltyAdd
			);
		};
	}, [
		applyPenalty
	]);
}

export default usePenaltyReceiver;