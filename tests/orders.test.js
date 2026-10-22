import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "@jest/globals";
import request from "supertest";
import app from "../src/index.js";

const orders = JSON.parse(
  readFileSync(
    join(dirname(fileURLToPath(import.meta.url)), "..", "data", "orders.json"),
    "utf8",
  ),
);

describe("GET /orders", () => {
  it("returns 200 and the full order list", async () => {
    const res = await request(app).get("/orders");

    expect(res.status).toBe(200);
    expect(res.body).toEqual(orders);
  });

  it("returns only orders with the requested status", async () => {
    const expected = orders.filter((order) => order.status === "pending");

    const res = await request(app).get("/orders").query({ status: "pending" });

    expect(res.status).toBe(200);
    expect(expected.length).toBeGreaterThan(0);
    expect(res.body).toEqual(expected);
    expect(res.body.every((order) => order.status === "pending")).toBe(true);
  });

  it("returns an empty list when no orders match the status", async () => {
    const res = await request(app).get("/orders").query({ status: "refunded" });

    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });

  it("returns only orders for the requested userId", async () => {
    const expected = orders.filter((order) => order.userId === 1);

    const res = await request(app).get("/orders").query({ userId: "1" });

    expect(res.status).toBe(200);
    expect(expected.length).toBeGreaterThan(0);
    expect(res.body).toEqual(expected);
    expect(res.body.every((order) => order.userId === 1)).toBe(true);
  });

  it("applies status and userId filters together", async () => {
    const expected = orders.filter(
      (order) => order.status === "delivered" && order.userId === 1,
    );

    const res = await request(app)
      .get("/orders")
      .query({ status: "delivered", userId: "1" });

    expect(res.status).toBe(200);
    expect(expected.length).toBeGreaterThan(0);
    expect(res.body).toEqual(expected);
  });

  it("returns an empty list when userId is not a number", async () => {
    const res = await request(app).get("/orders").query({ userId: "not-a-number" });

    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });

  it("returns an empty list when userId matches no orders", async () => {
    const res = await request(app).get("/orders").query({ userId: "999" });

    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });
});

describe("GET /orders/:id", () => {
  it("returns 200 and the matching order", async () => {
    const order = orders.find((item) => item.id === 1);

    const res = await request(app).get("/orders/1");

    expect(res.status).toBe(200);
    expect(res.body).toEqual(order);
  });

  it("returns 404 with an error body when the id does not exist", async () => {
    const res = await request(app).get("/orders/999");

    expect(res.status).toBe(404);
    expect(res.body).toEqual({
      error: {
        code: "NOT_FOUND",
        message: "Order with id 999 not found",
      },
    });
  });

  it("returns 404 when the id is not a number", async () => {
    const res = await request(app).get("/orders/abc");

    expect(res.status).toBe(404);
    expect(res.body).toEqual({
      error: {
        code: "NOT_FOUND",
        message: "Order with id abc not found",
      },
    });
  });
});
