import type { Product, ProductFilters } from "../types";

export function buildProductsUrl(
  baseUrl: string,
  filters: ProductFilters = {},
): string {
  const normalized = baseUrl.replace(/\/+$/, "");
  const url = new URL(`${normalized}/products`);

  if (filters.category) {
    url.searchParams.set("category", filters.category);
  }
  if (filters.inStockOnly) {
    url.searchParams.set("inStock", "true");
  }

  return url.toString();
}

export function uniqueCategories(products: Product[]): string[] {
  return [...new Set(products.map((product) => product.category))].sort();
}

type ApiErrorBody = {
  error?: { code?: string; message?: string };
};

export async function fetchProducts(
  baseUrl: string,
  filters: ProductFilters = {},
): Promise<Product[]> {
  const response = await fetch(buildProductsUrl(baseUrl, filters));
  if (!response.ok) {
    let message = `Request failed (${response.status})`;
    try {
      const body = (await response.json()) as ApiErrorBody;
      if (body.error?.message) {
        message = body.error.message;
      }
    } catch {
      // keep status message
    }
    throw new Error(message);
  }
  return response.json() as Promise<Product[]>;
}
