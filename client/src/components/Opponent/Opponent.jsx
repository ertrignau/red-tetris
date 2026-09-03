import Spectrum from "../Spectrum/Spectrum.jsx";

function Opponent({
	name,
	spectrum
}) {
	return (
		<div className="opponent">
			<div className="opponent-header">
				<span className="opponent-dot" />

				<strong>
					{name}
				</strong>
			</div>

			<Spectrum
				spectrum={
					spectrum
				}
			/>
		</div>
	);
}

export default Opponent;