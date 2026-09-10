import {
	useState
} from "react";

import PiecePreview
	from "../PiecePreview/PiecePreview.jsx";

function GamePanel({
	score,
	nextPiece
}) {
	const [
		showControls,
		setShowControls
	] = useState(false);

	return (
		<aside className="game-panel stats-panel">
			<div className="panel-header">
				<span className="panel-dot"></span>

				<h2>
					Game
				</h2>
			</div>

			<div className="score-block">
				<span className="score-label">
					SCORE
				</span>

				<strong className="score-value">
					{String(
						score
					).padStart(
						6,
						"0"
					)}
				</strong>
			</div>

			<div className="current-piece-block">
				<span className="current-piece-label">
					NEXT
				</span>

				<PiecePreview
					piece={
						nextPiece
					}
				/>
			</div>

			<div className="panel-divider"></div>

			<button
				type="button"
				className={
					showControls
						? "controls-toggle controls-toggle-open"
						: "controls-toggle"
				}
				onClick={() =>
					setShowControls(
						(current) =>
							!current
					)
				}
				aria-expanded={
					showControls
				}
			>
				<span className="controls-toggle-label">
					CONTROLS
				</span>

				<span className="controls-toggle-icon">
					⌄
				</span>
			</button>

			<div
				className={
					showControls
						? "controls-container controls-container-open"
						: "controls-container"
				}
			>
				<div className="controls">
					<div className="control-row">
						<span>
							Move
						</span>

						<div>
							<kbd>
								←
							</kbd>

							<kbd>
								→
							</kbd>
						</div>
					</div>

					<div className="control-row">
						<span>
							Rotate
						</span>

						<kbd>
							↑
						</kbd>
					</div>

					<div className="control-row">
						<span>
							Soft drop
						</span>

						<kbd>
							↓
						</kbd>
					</div>

					<div className="control-row">
						<span>
							Hard drop
						</span>

						<kbd>
							SPACE
						</kbd>
					</div>
				</div>
			</div>
		</aside>
	);
}

export default GamePanel;