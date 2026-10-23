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

  it("trims whitespace around the base URL", () => {
    expect(buildProductsUrl("  http://localhost:3000  ")).toBe(
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

  it("rejects an empty base URL", () => {
    expect(() => buildProductsUrl("")).toThrow(
      "API base URL is missing or empty.",
    );
    expect(() => buildProductsUrl("   ")).toThrow(
      "API base URL is missing or empty.",
    );
  });

  it("rejects an invalid base URL", () => {
    expect(() => buildProductsUrl("not-a-url")).toThrow(
      "API base URL is invalid: not-a-url",
    );
  });
});

describe("uniqueCategories", () => {
  it("returns sorted unique categories from sample products", () => {
    expect(uniqueCategories(sampleProducts)).toEqual([
      "electronics",
      "furniture",
    ]);
  });

  it("returns an empty list when there are no products", () => {
    expect(uniqueCategories([])).toEqual([]);
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
    expect(fetch).toHaveBeenCalledWith("http://localhost:3000/products");
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

  it("falls back to the status code when the error body is not JSON", async () => {
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
      "Request failed (502)",
    );
  });

  it("explains network failures clearly", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockRejectedValue(new TypeError("Failed to fetch")),
    );

    await expect(fetchProducts("http://localhost:3000")).rejects.toThrow(
      "Could not reach the API. Is it running, and is VITE_API_URL correct?",
    );
  });

  it("rejects a successful response that is not a JSON array", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ products: sampleProducts }),
      }),
    );

    await expect(fetchProducts("http://localhost:3000")).rejects.toThrow(
      "The API returned an unexpected products payload.",
    );
  });

  it("rejects a successful response that is not valid JSON", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => {
          throw new SyntaxError("Unexpected token");
        },
      }),
    );

    await expect(fetchProducts("http://localhost:3000")).rejects.toThrow(
      "The API returned a response that was not valid JSON.",
    );
  });

  it("surfaces invalid base URL errors without wrapping them as network errors", async () => {
    await expect(fetchProducts("")).rejects.toThrow(
      "API base URL is missing or empty.",
    );
  });
});
