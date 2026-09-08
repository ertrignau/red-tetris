import {
	useEffect
} from "react";

function useDropKeys({
	enabled,
	onHardDrop
}) {
	useEffect(() => {
		if (!enabled)
			return;

		const handleKeyDown =
			(event) => {
				if (
					event.code !==
					"Space"
				) {
					return;
				}

				event.preventDefault();

				if (
					event.repeat
				) {
					return;
				}

				if (
					onHardDrop
				) {
					onHardDrop();
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
		onHardDrop
	]);
}

export default useDropKeys;