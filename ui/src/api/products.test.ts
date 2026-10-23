import { afterEach, describe, expect, it, vi } from "vitest";
import { buildProductsUrl, fetchProducts, uniqueCategories } from "./products";
import type { Product } from "../types";

const sampleProducts: Product[] = [
  {
    id: 1,
    name: "Sample Mouse",
    price: 19.99,
    category: "electronics",
    inStock: true,
  },
  {
    id: 2,
    name: "Sample Desk",
    price: 199,
    category: "furniture",
    inStock: false,
  },
  {
    id: 3,
    name: "Sample Hub",
    price: 29.5,
    category: "electronics",
    inStock: true,
  },
];

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("buildProductsUrl", () => {
  it("builds the list URL with no filters", () => {
    expect(buildProductsUrl("http://localhost:3000")).toBe(
      "http://localhost:3000/products",
    );
  });

  it("strips a trailing slash from the base URL", () => {
    expect(buildProductsUrl("http://localhost:3000/")).toBe(
      "http://localhost:3000/products",
    );
  });

  it("adds category and inStock query params", () => {
    expect(
      buildProductsUrl("http://localhost:3000", {
        category: "electronics",
        inStockOnly: true,
      }),
    ).toBe("http://localhost:3000/products?category=electronics&inStock=true");
  });

  it("omits inStock when inStockOnly is false", () => {
    expect(
      buildProductsUrl("http://localhost:3000", {
        category: "accessories",
        inStockOnly: false,
      }),
    ).toBe("http://localhost:3000/products?category=accessories");
  });

  it("rejects a missing base URL with a next step", () => {
    expect(() => buildProductsUrl("")).toThrow(/Set VITE_API_URL/);
  });

  it("rejects an invalid base URL with a next step", () => {
    expect(() => buildProductsUrl("not-a-url")).toThrow(/full URL/);
  });
});

describe("uniqueCategories", () => {
  it("returns sorted unique categories from sample products", () => {
    expect(uniqueCategories(sampleProducts)).toEqual([
      "electronics",
      "furniture",
    ]);
  });
});

describe("fetchProducts", () => {
  it("returns products when the API responds with an array", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => sampleProducts,
      }),
    );

    await expect(fetchProducts("http://localhost:3000")).resolves.toEqual(
      sampleProducts,
    );
  });

  it("uses the API error.message when the response is not ok", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        status: 500,
        json: async () => ({
          error: { code: "SERVER_ERROR", message: "Catalog unavailable" },
        }),
      }),
    );

    await expect(fetchProducts("http://localhost:3000")).rejects.toThrow(
      "Catalog unavailable",
    );
  });

  it("falls back to a status message with a next step when the body is not JSON", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        status: 502,
        json: async () => {
          throw new Error("no json");
        },
      }),
    );

    await expect(fetchProducts("http://localhost:3000")).rejects.toThrow(
      /HTTP 502.*GET \/health/,
    );
  });

  it("explains network failures with a next step", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockRejectedValue(new TypeError("Failed to fetch")),
    );

    await expect(fetchProducts("http://localhost:3000")).rejects.toThrow(
      /Could not reach the API/,
    );
  });
});
