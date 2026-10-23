import { useEffect, useMemo, useState } from "react";
import { fetchProducts, uniqueCategories } from "./api/products";
import type { Product } from "./types";
import "./App.css";

const apiBaseUrl = import.meta.env.VITE_API_URL as string | undefined;

export default function App() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categoryOptions, setCategoryOptions] = useState<string[]>([]);
  const [category, setCategory] = useState("");
  const [inStockOnly, setInStockOnly] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const filters = useMemo(
    () => ({
      category: category || undefined,
      inStockOnly,
    }),
    [category, inStockOnly],
  );

  useEffect(() => {
    if (!apiBaseUrl) {
      setError("Missing VITE_API_URL. Copy .env.example to .env and set it.");
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    fetchProducts(apiBaseUrl, filters)
      .then((data) => {
        if (cancelled) return;
        setProducts(data);
        if (!category) {
          setCategoryOptions(uniqueCategories(data));
        }
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setProducts([]);
        setError(err instanceof Error ? err.message : "Failed to load products");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [filters, category]);

  return (
    <main className="page">
      <header className="header">
        <h1>Products</h1>
        <p>Browse sample catalog data from the REST API.</p>
      </header>

      <section className="filters" aria-label="Product filters">
        <label>
          Category
          <select
            value={category}
            onChange={(event) => setCategory(event.target.value)}
          >
            <option value="">All</option>
            {categoryOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>

        <label className="checkbox">
          <input
            type="checkbox"
            checked={inStockOnly}
            onChange={(event) => setInStockOnly(event.target.checked)}
          />
          In stock only
        </label>
      </section>

      {loading && <p className="status">Loading…</p>}
      {error && <p className="status error" role="alert">{error}</p>}

      {!loading && !error && (
        <ul className="product-list">
          {products.length === 0 ? (
            <li className="empty">No products match these filters.</li>
          ) : (
            products.map((product) => (
              <li key={product.id} className="product">
                <div>
                  <strong>{product.name}</strong>
                  <span className="meta">{product.category}</span>
                </div>
                <div className="side">
                  <span>${product.price.toFixed(2)}</span>
                  <span className={product.inStock ? "stock in" : "stock out"}>
                    {product.inStock ? "In stock" : "Out of stock"}
                  </span>
                </div>
              </li>
            ))
          )}
        </ul>
      )}
    </main>
  );
}
