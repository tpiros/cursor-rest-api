import type { Product, ProductFilters } from "../types";

export function buildProductsUrl(
  baseUrl: string,
  filters: ProductFilters = {},
): string {
  const normalized = baseUrl.trim().replace(/\/+$/, "");
  if (!normalized) {
    throw new Error("API base URL is missing or empty.");
  }

  let url: URL;
  try {
    url = new URL(`${normalized}/products`);
  } catch {
    throw new Error(`API base URL is invalid: ${baseUrl}`);
  }

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
  let response: Response;
  try {
    response = await fetch(buildProductsUrl(baseUrl, filters));
  } catch (err) {
    if (err instanceof Error && /API base URL/i.test(err.message)) {
      throw err;
    }
    throw new Error(
      "Could not reach the API. Is it running, and is VITE_API_URL correct?",
    );
  }

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

  let data: unknown;
  try {
    data = await response.json();
  } catch {
    throw new Error("The API returned a response that was not valid JSON.");
  }

  if (!Array.isArray(data)) {
    throw new Error("The API returned an unexpected products payload.");
  }

  return data as Product[];
}
