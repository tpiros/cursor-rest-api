import type { Product, ProductFilters } from "../types";

export function buildProductsUrl(
  baseUrl: string,
  filters: ProductFilters = {},
): string {
  const normalized = baseUrl.trim().replace(/\/+$/, "");
  if (!normalized) {
    throw new Error(
      "API base URL is missing. Set VITE_API_URL in ui/.env (see .env.example) and restart the UI.",
    );
  }

  let url: URL;
  try {
    url = new URL(`${normalized}/products`);
  } catch {
    throw new Error(
      `API base URL is invalid (${baseUrl}). Set VITE_API_URL to a full URL like http://localhost:3000.`,
    );
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
      "Could not reach the API. Start it (npm run dev or npm start) and confirm VITE_API_URL points at it.",
    );
  }

  if (!response.ok) {
    let message = `The API returned HTTP ${response.status}. Confirm the API is healthy (GET /health) and VITE_API_URL is correct.`;
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
    throw new Error(
      "The API response was not valid JSON. Confirm VITE_API_URL points at this REST API, not another service.",
    );
  }

  if (!Array.isArray(data)) {
    throw new Error(
      "The API returned an unexpected products payload. Expected a JSON array of products from GET /products.",
    );
  }

  return data as Product[];
}
