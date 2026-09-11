import {
	describe,
	expect,
	it,
	vi
} from "vitest";

const mocks = vi.hoisted(() => ({
	render: vi.fn(),
	createRoot: vi.fn()
}));

mocks.createRoot.mockReturnValue({
	render: mocks.render
});

vi.mock("react-dom/client", () => ({
	default: {
		createRoot: mocks.createRoot
	}
}));

vi.mock("../src/app/router.jsx", () => ({
	default: {}
}));

vi.mock("react-router-dom", () => ({
	RouterProvider: () => <div>router</div>
}));

describe("main", () => {
	it("mounts the React application", async () => {
		document.body.innerHTML =
			'<div id="root"></div>';

		await import("../src/main.jsx");

		expect(
			mocks.createRoot
		).toHaveBeenCalledWith(
			document.getElementById("root")
		);

		expect(mocks.render).toHaveBeenCalledOnce();
	});
});
