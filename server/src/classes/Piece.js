class Piece {
	static TYPES = [
		"I",
		"O",
		"T",
		"S",
		"Z",
		"J",
		"L"
	];

	constructor(type) {
		if (
			!Piece.isValidType(
				type
			)
		) {
			throw new Error(
				`Invalid piece type: ${type}`
			);
		}

		this.type =
			type;
	}

	static isValidType(type) {
		return Piece.TYPES.includes(
			type
		);
	}

	/*
	 * Generate one shuffled
	 * seven-piece bag.
	 */
	static generateBag() {
		const bag =
			Piece.TYPES.map(
				(type) =>
					new Piece(
						type
					)
			);

		for (
			let i =
				bag.length - 1;
			i > 0;
			i--
		) {
			const j =
				Math.floor(
					Math.random() *
						(i + 1)
				);

			[
				bag[i],
				bag[j]
			] = [
				bag[j],
				bag[i]
			];
		}

		return bag;
	}
}

export default Piece;