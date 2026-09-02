import Cell from "../Cell/Cell.jsx";

function Board({ board, piece }) {
	const displayBoard = board.map((row) => [...row]);

	if (piece) {
		const shape = piece.shape;

		shape.forEach((row, y) => {
			row.forEach((cell, x) => {
				if (!cell)
					return;

				const boardY = piece.y + y;
				const boardX = piece.x + x;

				if (
					boardY >= 0 &&
					boardY < displayBoard.length &&
					boardX >= 0 &&
					boardX < displayBoard[0].length
				) {
					displayBoard[boardY][boardX] = piece.type;
				}
			});
		});
	}


return (
	<div className="board">
		{displayBoard.flat().map((cell, index) => (
			<Cell
				key={index}
				value={cell}
			/>
		))}
		</div>
	)
}

export default Board;
