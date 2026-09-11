import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import GameHeader from "../../src/components/GameHeader/GameHeader.jsx";

describe("GameHeader", () => {
	it("renders the game title", () => {
		render(<GameHeader room="alpha" />);
		expect(screen.getByText("RED")).toBeTruthy();
		expect(screen.getByText(/TETRIS/)).toBeTruthy();
	});

	it("renders the room in uppercase", () => {
		render(<GameHeader room="room42" />);
		expect(screen.getByText(/ROOM42/)).toBeTruthy();
	});
});
