export type Product = {
  id: number;
  name: string;
  price: number;
  category: string;
  inStock: boolean;
};

export type ProductFilters = {
  category?: string;
  inStockOnly?: boolean;
};
