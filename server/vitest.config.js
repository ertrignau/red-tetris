import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    clearMocks: true,
    restoreMocks: true,
    mockReset: true
  },
  coverage: {
    provider: "v8",
    include: ["src/**/*.js"],
    exclude: [
      "src/server.js",
      "src/protocol/events.js",
      "src/socket/playerHandlers.js"
    ],
    thresholds: {
      statements: 70,
      branches: 50,
      functions: 70,
      lines: 70
    }
  }
});
