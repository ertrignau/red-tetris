function PiecePreview({ piece }) {
	if (!piece)
		return (
			<div className="piece-preview empty-preview">
				-
			</div>
		);

	const shape = piece.shape;

	return (
		<div
			className="piece-preview"
			style={{
				gridTemplateColumns: `repeat(${shape[0].length}, 18px)`,
				gridTemplateRows: `repeat(${shape.length}, 18px)`
			}}
		>
			{shape.flat().map((cell, index) => (
				<div
					key={index}
					className={
						cell
							? `preview-cell cell-${piece.type}`
							: "preview-cell"
					}
				/>
			))}
		</div>
	);
}

export default PiecePreview;