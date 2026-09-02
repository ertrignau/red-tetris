function Cell({ value }) {
	return (
		<div
			className={`cell ${value ? `cell-${value}` : ""}`}
		/>
	);
}

export default Cell;