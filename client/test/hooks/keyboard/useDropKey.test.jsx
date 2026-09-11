import {
	describe,
	it,
	expect,
	vi
} from "vitest";

import {
	renderHook
} from "@testing-library/react";

import useDropKeys
	from "../../../src/hooks/keyboard/useDropKey.js";

describe("useDropKeys", () => {
	it("calls hard drop when Space is pressed", () => {
		const onHardDrop =
			vi.fn();

		renderHook(
			() =>
				useDropKeys({
					enabled: true,
					onHardDrop
				})
		);

		window.dispatchEvent(
			new KeyboardEvent(
				"keydown",
				{
					code: "Space"
				}
			)
		);

		expect(
			onHardDrop
		).toHaveBeenCalledTimes(1);
	});

	it("does nothing when disabled", () => {
		const onHardDrop =
			vi.fn();

		renderHook(
			() =>
				useDropKeys({
					enabled: false,
					onHardDrop
				})
		);

		window.dispatchEvent(
			new KeyboardEvent(
				"keydown",
				{
					code: "Space"
				}
			)
		);

		expect(
			onHardDrop
		).not.toHaveBeenCalled();
	});

	it("ignores keys other than Space", () => {
		const onHardDrop =
			vi.fn();

		renderHook(
			() =>
				useDropKeys({
					enabled: true,
					onHardDrop
				})
		);

		window.dispatchEvent(
			new KeyboardEvent(
				"keydown",
				{
					code:
						"ArrowDown"
				}
			)
		);

		expect(
			onHardDrop
		).not.toHaveBeenCalled();
	});

	it("ignores repeated Space events", () => {
		const onHardDrop =
			vi.fn();

		renderHook(
			() =>
				useDropKeys({
					enabled: true,
					onHardDrop
				})
		);

		window.dispatchEvent(
			new KeyboardEvent(
				"keydown",
				{
					code: "Space",
					repeat: true
				}
			)
		);

		expect(
			onHardDrop
		).not.toHaveBeenCalled();
	});

	it("works without an onHardDrop callback", () => {
		expect(() => {
			renderHook(
				() =>
					useDropKeys({
						enabled: true,
						onHardDrop:
							undefined
					})
			);

			window.dispatchEvent(
				new KeyboardEvent(
					"keydown",
					{
						code:
							"Space"
					}
				)
			);
		}).not.toThrow();
	});

	it("removes the listener when unmounted", () => {
		const onHardDrop =
			vi.fn();

		const {
			unmount
		} = renderHook(
			() =>
				useDropKeys({
					enabled: true,
					onHardDrop
				})
		);

		unmount();

		window.dispatchEvent(
			new KeyboardEvent(
				"keydown",
				{
					code: "Space"
				}
			)
		);

		expect(
			onHardDrop
		).not.toHaveBeenCalled();
	});
});