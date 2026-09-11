import { describe, expect, it } from "vitest";
import router from "../../src/app/router.jsx";

describe("router", () => {
	it("defines home and game routes", () => {
		const paths =
			router.routes.map(
				(route) => route.path
			);

		expect(paths).toContain("/");
		expect(paths).toContain("/:room/:player");
	});
});
