import { describe, expect, it } from "vitest";
import request from "supertest";
import app from "../../src/app.js";

describe("Express app", () => {
  it("returns health status", async () => {
    const response = await request(app).get("/health");
    expect(response.status).toBe(200);
    expect(response.body).toEqual({ status: "ok" });
  });

  it("exposes Prometheus metrics", async () => {
    const response = await request(app).get("/metrics");
    expect(response.status).toBe(200);
    expect(response.text).toContain("red_tetris_connected_sockets");
  });
});
