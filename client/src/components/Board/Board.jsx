import Cell from "../Cell/Cell.jsx";

import {
	getGhostPiece
} from "../../game/drop.js";

function Board({
	board,
	piece
}) {
	const displayBoard =
		board.map(
			(row) => [...row]
		);

	const ghostPiece =
		piece
			? getGhostPiece(
				board,
				piece
			)
			: null;

	/*
	 * Draw ghost piece first.
	 */
	if (ghostPiece) {
		ghostPiece.shape.forEach(
			(row, y) => {
				row.forEach(
					(cell, x) => {
						if (!cell)
							return;

						const boardY =
							ghostPiece.y + y;

						const boardX =
							ghostPiece.x + x;

						if (
							boardY >= 0 &&
							boardY <
								displayBoard.length &&
							boardX >= 0 &&
							boardX <
								displayBoard[0].length &&
							displayBoard[
								boardY
							][
								boardX
							] === null
						) {
							displayBoard[
								boardY
							][
								boardX
							] =
								`ghost-${ghostPiece.type}`;
						}
					}
				);
			}
		);
	}

	/*
	 * Draw current piece on top.
	 */
	if (piece) {
		piece.shape.forEach(
			(row, y) => {
				row.forEach(
					(cell, x) => {
						if (!cell)
							return;

						const boardY =
							piece.y + y;

						const boardX =
							piece.x + x;

						if (
							boardY >= 0 &&
							boardY <
								displayBoard.length &&
							boardX >= 0 &&
							boardX <
								displayBoard[0].length
						) {
							displayBoard[
								boardY
							][
								boardX
							] =
								piece.type;
						}
					}
				);
			}
		);
	}

	return (
		<div className="board">
			{displayBoard
				.flat()
				.map(
					(cell, index) => (
						<Cell
							key={
								index
							}
							value={
								cell
							}
						/>
					)
				)}
		</div>
	);
}

export default Board;