import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "@jest/globals";
import request from "supertest";
import app from "../src/index.js";

const products = JSON.parse(
  readFileSync(
    join(dirname(fileURLToPath(import.meta.url)), "..", "data", "products.json"),
    "utf8",
  ),
);

describe("GET /products", () => {
  it("returns 200 and the product list", async () => {
    const res = await request(app).get("/products");

    expect(res.status).toBe(200);
    expect(res.body).toEqual(products);
  });

  it("returns only electronics when category=electronics", async () => {
    const expected = products.filter((product) => product.category === "electronics");

    const res = await request(app).get("/products").query({ category: "electronics" });

    expect(res.status).toBe(200);
    expect(expected.length).toBeGreaterThan(0);
    expect(res.body).toEqual(expected);
    expect(res.body.every((product) => product.category === "electronics")).toBe(true);
  });

  it("returns only in-stock products when inStock=true", async () => {
    const expected = products.filter((product) => product.inStock === true);

    const res = await request(app).get("/products").query({ inStock: "true" });

    expect(res.status).toBe(200);
    expect(expected.length).toBeGreaterThan(0);
    expect(res.body).toEqual(expected);
    expect(res.body.every((product) => product.inStock === true)).toBe(true);
  });

  it("applies category and inStock filters together", async () => {
    const expected = products.filter(
      (product) => product.category === "electronics" && product.inStock === true,
    );

    const res = await request(app)
      .get("/products")
      .query({ category: "electronics", inStock: "true" });

    expect(res.status).toBe(200);
    expect(expected.length).toBeGreaterThan(0);
    expect(res.body).toEqual(expected);
    expect(
      res.body.every(
        (product) => product.category === "electronics" && product.inStock === true,
      ),
    ).toBe(true);
  });
});

describe("GET /products/:id", () => {
  it("returns 200 and the matching product", async () => {
    const product = products.find((item) => item.id === 1);

    const res = await request(app).get("/products/1");

    expect(res.status).toBe(200);
    expect(res.body).toEqual(product);
  });

  it("returns 404 with an error body when the id does not exist", async () => {
    const res = await request(app).get("/products/999");

    expect(res.status).toBe(404);
    expect(res.body).toEqual({
      error: {
        code: "NOT_FOUND",
        message: "Product with id 999 not found",
      },
    });
  });
});
