import { describe, expect, it } from "vitest";
import { buildProductsUrl, uniqueCategories } from "./products";
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
});

describe("uniqueCategories", () => {
  it("returns sorted unique categories from sample products", () => {
    expect(uniqueCategories(sampleProducts)).toEqual([
      "electronics",
      "furniture",
    ]);
  });
});
