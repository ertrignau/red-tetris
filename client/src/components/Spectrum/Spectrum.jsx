function Spectrum({
	spectrum
}) {
	return (
		<div className="spectrum">
			{spectrum.map(
				(height, index) => (
					<div
						key={index}
						className="spectrum-column"
					>
						<div
							className="spectrum-fill"
							style={{
								height:
									`${height * 5}px`
							}}
						/>
					</div>
				)
			)}
		</div>
	);
}

export default Spectrum;